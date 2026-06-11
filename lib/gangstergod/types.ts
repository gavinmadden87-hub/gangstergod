export type MissionEnvironment = 'local' | 'preview' | 'staging' | 'production';

export type MissionVisibility = 'internal' | 'public';

export type MissionStatus = 'allowed' | 'blocked' | 'approval_required';

export type Mission = {
  id?: string;
  missionId?: string;
  type?: string;
  action?: string;
  intent?: string;
  environment?: MissionEnvironment | string;
  env?: MissionEnvironment | string;
  visibility?: MissionVisibility | string;
  audience?: MissionVisibility | string;
  channel?: string;
  actor?: string;
  approved?: boolean;
  authorized?: boolean;
  approvedBy?: string;
  authorizationToken?: string;
  payload?: Record<string, unknown>;
};

export type MissionContext = {
  actor?: string;
  productionDeploymentAuthorized?: boolean;
  customerMessagingApproved?: boolean;
  [key: string]: unknown;
};

export type AuthorityDecision = {
  missionId: string;
  action: string;
  environment: string;
  channel: string | null;
  actor: string;
  allowed: boolean;
  status: MissionStatus;
  authorityLevel: 'god_head_required' | 'human_approval_required' | 'local_autonomy' | 'standard_autonomy';
  reason: string;
  timestamp: string;
};

export type ScientificSkillName =
  | 'scientific-brainstorming'
  | 'scientific-critical-thinking'
  | 'scientific-schematics'
  | 'scientific-slides'
  | 'scientific-visualization'
  | 'scientific-writing';

export type GangsterGodAgentName =
  | 'HypothesisForgeAgent'
  | 'RedTeamAuditAgent'
  | 'SystemDiagramAgent'
  | 'PitchDeckAgent'
  | 'SignalVizAgent'
  | 'AuthorityWritingAgent';

export type ScientificMissionType = 'brainstorm' | 'audit' | 'diagram' | 'deck' | 'visualize' | 'write';

export type SkillRoute = {
  routed: boolean;
  missionId: string | null;
  missionType: string | null;
  skillName: ScientificSkillName | null;
  agentName: GangsterGodAgentName | null;
  priority: string;
  source: string;
  skillRole: {
    agent: GangsterGodAgentName;
    useCase: string;
  } | null;
};

export type MissionHandler = {
  execute: (mission: Mission, context: MissionContext & { route?: SkillRoute; decision?: AuthorityDecision | null }) => Promise<unknown> | unknown;
};

export type AgentRegistry = {
  get?: (agentName: GangsterGodAgentName) => MissionHandler | undefined;
  resolve?: (mission: Mission & { skillName?: ScientificSkillName | null; agentName?: GangsterGodAgentName | null }) => MissionHandler | undefined;
};

export type EventBus = {
  emit: (name: string, payload: unknown) => void;
};
