"use client";

import { useState } from "react";

export default function Home() {
  const [focus, setFocus] = useState("discipline");
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/routine", {
        method: "POST",
        body: JSON.stringify({ focus })
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setRoutine(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate routine";
      setError(errorMessage);
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-4xl font-bold mb-4">Gangster God OS</h1>

      <input
        className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded"
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
      />

      <button
        onClick={generate}
        className="bg-white text-black px-4 py-2 rounded ml-3"
      >
        {loading ? "Loading..." : "Generate"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded text-red-200">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {routine && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Summary</h2>
          <p>{routine.summary}</p>

          {Array.isArray(routine.morning) && (
            <>
              <h3 className="font-semibold">Morning</h3>
              <ul className="list-disc ml-5">
                {routine.morning.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </main>
  );
}
