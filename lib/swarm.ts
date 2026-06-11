import {
  outcomeLogRepository,
  weightHistoryRepository,
} from "./db/repositories";
import { type SelectOutcomeLog, type SelectWeightHistory } from "./db/schema";

// ---------------------------------------------------------------------------
// Payload encryption helpers (AES-256-GCM + HMAC-SHA-256 integrity)
// ---------------------------------------------------------------------------

/** Read an env variable without requiring @types/node process typings. */
function getEnv(key: string): string | undefined {
  return (
    typeof process !== "undefined" ? process.env[key] : undefined
  ) as string | undefined;
}

/**
 * Returns a 32-byte AES key derived from the PQC_SECRET environment variable
 * via HKDF-SHA-256.  Falls back to a fixed dev key when the variable is absent.
 *
 * NOTE: Replace with a proper ML-KEM-768 key-encapsulation exchange once a
 * liboqs Node.js binding is available.  The slot is intentionally labelled so
 * the upgrade path is visible.
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = getEnv("PQC_SECRET") ?? "dev-secret-replace-in-production";
  const enc = new TextEncoder();
  const raw = enc.encode(secret);

  const baseKey = await crypto.subtle.importKey("raw", raw, "HKDF", false, [
    "deriveKey",
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: enc.encode("swarm-payload-encryption-v1"),
      info: enc.encode("aes-256-gcm"),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts `plaintext` with AES-256-GCM and wraps the result together with an
 * HMAC-SHA-256 integrity token in a structured envelope.
 *
 * The HMAC is computed over the base-64 ciphertext so that any tampering of
 * the stored blob is detectable before decryption is attempted.
 *
 * Returns a JSON string safe to persist in the payload column.
 */
export async function encryptPayload(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();

  // 96-bit IV is the NIST-recommended size for AES-GCM.
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );

  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(
    String.fromCharCode(...new Uint8Array(cipherBuf)),
  );

  // HMAC-SHA-256 integrity over "iv:cipher" so both components are bound.
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(getEnv("PQC_SECRET") ?? "dev-secret-replace-in-production"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const macBuf = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    enc.encode(`${ivB64}:${cipherB64}`),
  );
  const macB64 = btoa(String.fromCharCode(...new Uint8Array(macBuf)));

  return JSON.stringify({
    alg: "AES-256-GCM+HMAC-SHA-256",
    // Slot reserved for ML-KEM-768 encapsulated symmetric key once liboqs
    // Node.js bindings are integrated (NIST FIPS 203 / ML-KEM-768-Hybrid).
    pqc_kem: "pending-ML-KEM-768",
    iv: ivB64,
    ciphertext: cipherB64,
    mac: macB64,
  });
}

// ---------------------------------------------------------------------------
// CSPRNG entropy helper for weight mutation noise
// ---------------------------------------------------------------------------

/**
 * Returns a small float in [-0.05, +0.05] drawn from the OS CSPRNG
 * (crypto.getRandomValues, backed by the OS entropy pool).
 *
 * This is cryptographically secure pseudo-random noise — sufficient to prevent
 * adversarial prediction of mutation deltas.  It is NOT a hardware QRNG; label
 * it accurately.  A true QRNG feed (e.g. ANU / ID Quantique API) can replace
 * this function as an optional enhancement without changing callers.
 */
function getCsprngNoise(): number {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const intVal = new DataView(buf.buffer).getUint32(0, false);
  // Map [0, 2^32) → [-0.05, +0.05]
  return (intVal / 0xffffffff) * 0.1 - 0.05;
}

export type BlackboardEvent = {
  id: string;
  agentId: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type OutcomeLogEntry = SelectOutcomeLog;

export type WeightHistoryEntry = SelectWeightHistory;

export class Blackboard {
  private readonly events: BlackboardEvent[] = [];

  publish(event: Omit<BlackboardEvent, "id" | "createdAt">): BlackboardEvent {
    const createdAt = new Date().toISOString();
    const materialized: BlackboardEvent = {
      ...event,
      id: `bb_${createdAt}_${this.events.length + 1}`,
      createdAt,
    };
    this.events.push(materialized);
    return materialized;
  }

  getEvents(): BlackboardEvent[] {
    return [...this.events];
  }
}

export class ConsensusEngine {
  evaluate(event: BlackboardEvent): { score: number; accepted: boolean } {
    const base = (event.action.length + Object.keys(event.payload).length) / 20;
    // Inject CSPRNG noise so the score is non-deterministic; adversarial models
    // cannot predict acceptance from observable inputs alone.
    const noise = getCsprngNoise();
    const score = Math.min(1, Math.max(0, base + noise));
    return {
      score,
      accepted: score >= 0.3,
    };
  }
}

export type StrategyMutationInput = {
  agentId: string;
  strategy: string;
  previousWeight: number;
  signalStrength: number;
  reason: string;
};

export type StrategyMutationResult = {
  historyEntry: WeightHistoryEntry;
  outcomeEntry: OutcomeLogEntry;
  weightHistorySize: number;
  outcomeLogSize: number;
};

export const blackboard = new Blackboard();
export const consensusEngine = new ConsensusEngine();

export async function getMutationCounts(): Promise<{ weightHistorySize: number; outcomeLogSize: number }> {
  const [weightHistorySize, outcomeLogSize] = await Promise.all([
    weightHistoryRepository.count(),
    outcomeLogRepository.count(),
  ]);

  return { weightHistorySize, outcomeLogSize };
}

export async function triggerStrategyMutation(input: StrategyMutationInput): Promise<StrategyMutationResult> {
  const event = blackboard.publish({
    agentId: input.agentId,
    action: "strategy_mutation",
    payload: {
      strategy: input.strategy,
      signalStrength: input.signalStrength,
      reason: input.reason,
    },
  });

  const consensus = consensusEngine.evaluate(event);

  // Encrypt the event payload before persisting.  The plaintext is never
  // written to the database; only the AES-256-GCM ciphertext envelope is stored.
  const encryptedPayload = await encryptPayload(JSON.stringify(event.payload));

  const outcomeEntry = await outcomeLogRepository.insert({
    id: `ol_${Date.now()}`,
    agentId: event.agentId,
    action: event.action,
    payload: { encrypted: encryptedPayload },
    consensusScore: consensus.score,
    accepted: consensus.accepted,
    createdAt: event.createdAt,
  });

  const delta = consensus.accepted ? input.signalStrength * 0.1 : -input.signalStrength * 0.05;
  const historyEntry = await weightHistoryRepository.insert({
    id: `wh_${Date.now()}`,
    strategy: input.strategy,
    previousWeight: input.previousWeight,
    newWeight: Number((input.previousWeight + delta).toFixed(4)),
    delta: Number(delta.toFixed(4)),
    reason: input.reason,
    outcomeLogId: outcomeEntry.id,
    createdAt: new Date().toISOString(),
  });

  const counts = await getMutationCounts();

  return {
    historyEntry,
    outcomeEntry,
    ...counts,
  };
}
