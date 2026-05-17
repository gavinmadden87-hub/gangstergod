"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [focus, setFocus] = useState("Phase 13 dashboard finalization");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#4C1D95_0%,transparent_70%)] opacity-30" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pb-32 pt-24 text-center">
        <label htmlFor="focus-input" className="sr-only">
          Focus
        </label>
        <input
          id="focus-input"
          className="mb-8 rounded border border-cyan-500/40 bg-zinc-900 px-3 py-2 text-center text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.22)] outline-none focus:border-pink-400"
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
        />

        <div className="mb-8">
          <h1 className="text-[72px] font-black leading-none tracking-[-4px] text-pink-300 drop-shadow-[0_0_22px_rgba(236,72,153,0.65)] md:text-[120px]">
            GANGSTERGODOS
          </h1>
          <p className="mt-3 text-xl font-light tracking-wide text-cyan-300 md:text-2xl">
            HEARTLESS 575 • APEX LEGION
          </p>
        </div>

        <div className="mx-auto mb-16 max-w-2xl">
          <p className="text-2xl font-medium leading-tight text-zinc-200 md:text-3xl">
            36 cold-blooded agents.<br />
            One command. Total empire execution.
          </p>
          <p className="mx-auto mt-6 max-w-md text-lg text-zinc-400">
            No love. No mercy. Only dominance.<br />
            Built for operators who move in silence and strike with precision.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 px-12 py-6 text-2xl font-bold shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-pink-500/50 active:scale-95 md:px-16 md:py-8 md:text-3xl"
          >
            <span className="relative z-10">ENTER DASHBOARD</span>
            <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
          </Link>
          <Link
            href="/admin/mutation-test"
            className="inline-flex items-center justify-center rounded-3xl border border-pink-500/60 bg-pink-500/10 px-8 py-6 text-xl font-bold text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.28)] transition hover:bg-pink-500/20"
          >
            Strategy Mutation
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-md grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-cyan-300">36</div>
            <div className="mt-1 text-xs tracking-widest text-zinc-500">AGENTS</div>
          </div>
          <div>
            <div className="text-4xl font-black text-pink-300">∞</div>
            <div className="mt-1 text-xs tracking-widest text-zinc-500">PARALLEL</div>
          </div>
          <div>
            <div className="text-4xl font-black text-purple-300">0</div>
            <div className="mt-1 text-xs tracking-widest text-zinc-500">MERCY</div>
          </div>
        </div>

        <div className="absolute bottom-12 text-xs tracking-widest text-zinc-600">
          HEARTLESS 575 • GANGSTERGODOS v0.1 • {focus.toUpperCase()}
        </div>
      </div>
    </main>
  );
}
