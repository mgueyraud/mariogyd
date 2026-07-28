import Link from "next/link";
import LorenzButterflies from "@/components/custom/LorenzButterflies";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* The mask keeps the copy legible while the butterflies circle it */}
      <LorenzButterflies className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(115vmin,900px)] -translate-x-1/2 -translate-y-1/2 opacity-70 [mask-image:radial-gradient(ellipse_42%_30%_at_50%_50%,transparent_20%,black_100%)]" />

      <div className="relative flex flex-col items-center">
        <div className="font-mono text-xs tracking-[0.14em] text-faint">404</div>

        <h1 className="mt-5 font-serif text-[clamp(34px,9vw,44px)] font-medium italic leading-tight tracking-[-0.01em]">
          Amor fati<span className="animate-breathe">.</span>
        </h1>

        <p className="mt-[18px] max-w-[38ch] text-subtle [text-wrap:pretty]">
          This page doesn&apos;t exist — and perhaps it was never meant to. Love
          what happens, even the dead ends.
        </p>

        <Link
          href="/"
          className="mt-8 text-[13px] underline decoration-line-strong underline-offset-[3px] transition-colors hover:decoration-ink"
        >
          Return home
        </Link>
      </div>

      <div className="absolute bottom-6 font-mono text-[10px] tracking-[0.1em] text-line-strong">
        NIETZSCHE, PROBABLY EXPECTING THIS
      </div>
    </main>
  );
}
