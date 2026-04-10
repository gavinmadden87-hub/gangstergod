"use client";

import { useState } from "react";

export default function Home() {
  const [focus, setFocus] = useState("discipline");
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/routine", {
      method: "POST",
      body: JSON.stringify({ focus })
    });
    const data = await res.json();
    setRoutine(data);
    setLoading(false);
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

      {routine && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Summary</h2>
          <p>{routine.summary}</p>

          <h3 className="font-semibold">Morning</h3>
          <ul className="list-disc ml-5">
            {routine.morning.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
