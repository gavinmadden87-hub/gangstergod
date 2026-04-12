import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#4C1D95_0%,transparent_70%)] opacity-30" />

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center min-h-screen justify-center">
        
        {/* Logo / Title */}
        <div className="mb-8">
          <h1 className="text-[92px] md:text-[120px] font-black tracking-[-4px] leading-none heartless-drip">
            GANGSTERGODOS
          </h1>
          <p className="text-purple-400 text-xl md:text-2xl tracking-wide mt-3 font-light">
            HEARTLESS 575 • APEX LEGION
          </p>
        </div>

        {/* Tagline */}
        <div className="max-w-2xl mx-auto mb-16">
          <p className="text-2xl md:text-3xl font-medium text-zinc-200 leading-tight">
            36 cold-blooded agents.<br />
            One command. Total empire execution.
          </p>
          <p className="mt-6 text-zinc-400 text-lg max-w-md mx-auto">
            No love. No mercy. Only dominance.<br />
            Built for operators who move in silence and strike with precision.
          </p>
        </div>

        {/* Enter Button */}
        <Link
          href="/swarm"
          className="group relative inline-flex items-center justify-center px-16 py-8 text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 rounded-3xl shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative z-10">ENTER THE SWARM</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-3 gap-8 text-center w-full max-w-md">
          <div>
            <div className="text-4xl font-black text-purple-400">36</div>
            <div className="text-xs tracking-widest text-zinc-500 mt-1">AGENTS</div>
          </div>
          <div>
            <div className="text-4xl font-black text-purple-400">∞</div>
            <div className="text-xs tracking-widest text-zinc-500 mt-1">PARALLEL</div>
          </div>
          <div>
            <div className="text-4xl font-black text-purple-400">0</div>
            <div className="text-xs tracking-widest text-zinc-500 mt-1">MERCY</div>
          </div>
        </div>

        {/* Footer Line */}
        <div className="absolute bottom-12 text-xs text-zinc-600 tracking-widest">
          HEARTLESS 575 • GANGSTERGODOS v0.1 • BUILT FOR THE EMPIRE
        </div>
      </div>
    </main>
  );
}
