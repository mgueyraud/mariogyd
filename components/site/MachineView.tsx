"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COPIED_FOR_MS = 1600;

/*
 * Ink-page palette. Nothing else on the site is set in light-on-dark, so these
 * stay local rather than becoming theme tokens.
 */
const DARK = {
  prefix: "text-[#5e5e58]",
  text: "text-[#d8d8cf]",
  quiet: "text-[#97978f]",
  heading: "font-semibold text-paper",
  rule: "border-[#3a3a36]",
  hover: "hoverable:bg-[#2a2a27]",
  link: "underline decoration-[#5e5e58] underline-offset-[3px] transition-colors hoverable:decoration-paper hoverable:text-paper",
};

/**
 * Colours one line of the mirror by its markdown prefix. Only the handful of
 * prefixes lib/site-markdown.ts emits — this is a tint, not a parser.
 */
function toneOf(line: string) {
  const m = line.match(/^(#+ |- |> |  )(.*)$/);
  const prefix = m ? m[1] : "";
  const text = m ? m[2] : line;
  const heading = prefix.startsWith("#");
  const quiet = prefix === "> " || prefix === "  ";
  return {
    prefix,
    text,
    className: heading ? DARK.heading : quiet ? DARK.quiet : DARK.text,
  };
}

/*
 * The scramble. The TV came back on the wrong channel: every glyph is noise,
 * dim, and the real text resolves across it from the top left to the bottom
 * right. A glyph's turn comes from its row mostly and its column a little, so
 * the front runs down the page with a slant. Within a line that front only
 * ever moves right, which is what lets a line be three spans — the prefix,
 * the resolved head, the noisy tail — rewritten in place, with no per-glyph
 * elements. Whitespace stays whitespace so wrapped lines never reflow.
 */
export type Scramble = {
  /** The sweep from the first glyph resolving to the last, seconds. */
  duration: number;
  /** How long it all stays noise before the sweep starts, seconds. */
  hold: number;
  /** How often the noise re-rolls, ms. Slower than the frame rate flickers; faster boils. */
  reroll: number;
  /** How much a glyph's turn owes to its row vs its column, 0–1. 1 is row by row, 0 is column by column. */
  slant: number;
};

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789/\\|<>;:,.+=*_-";

function noise(source: string) {
  let out = "";
  for (let i = 0; i < source.length; i++) {
    out += source[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
  }
  return out;
}

/** The mirror, set light-on-ink. Lives inside the ViewModeProvider's overlay. */
export default function MachineView({
  markdown,
  scramble,
}: {
  markdown: string;
  /** Run the scramble on mount. Leave out to show the text as is. */
  scramble?: Scramble;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  const linesRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => markdown.split("\n").map(toneOf), [markdown]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Layout effect so the first painted frame is already noise.
  const duration = scramble?.duration;
  const hold = scramble?.hold;
  const reroll = scramble?.reroll;
  const slant = scramble?.slant;
  useLayoutEffect(() => {
    if (duration === undefined || hold === undefined || reroll === undefined || slant === undefined) return;
    const root = linesRef.current;
    if (!root) return;
    const rows = Array.from(root.children) as HTMLElement[];
    const R = rows.length;
    const C = Math.max(1, ...lines.map((l) => l.prefix.length + l.text.length));
    const start = performance.now();
    // Clamped off the ends so neither weight divides by zero.
    const rowW = Math.min(0.99, Math.max(0.01, slant));
    const colW = 1 - rowW;
    let raf = 0;
    let lastRoll = -1;

    const paint = (now: number) => {
      const t = (now - start) / 1000 - hold;
      const p = duration > 0 ? Math.min(1, Math.max(0, t / duration)) : t >= 0 ? 1 : 0;
      const roll = Math.floor((now - start) / Math.max(1, reroll));
      const rerolled = roll !== lastRoll;
      lastRoll = roll;

      rows.forEach((row, r) => {
        const { prefix, text } = lines[r];
        const full = prefix.length + text.length;
        // Glyph c of row r resolves once p passes rowW·r/R + colW·c/C.
        const k =
          p >= 1
            ? full
            : Math.max(0, Math.min(full, Math.floor(((p - (rowW * r) / R) / colW) * C) + 1));
        if (row.dataset.k === String(k) && (k === full || !rerolled)) return;
        row.dataset.k = String(k);
        const [pre, head, tail] = row.children as unknown as HTMLElement[];
        const kp = Math.min(k, prefix.length);
        const kt = Math.max(0, k - prefix.length);
        pre.textContent = prefix.slice(0, kp) + noise(prefix.slice(kp));
        head.textContent = text.slice(0, kt);
        tail.textContent = noise(text.slice(kt));
      });

      if (p < 1) raf = requestAnimationFrame(paint);
    };

    paint(performance.now());
    return () => cancelAnimationFrame(raf);
  }, [lines, duration, hold, reroll, slant]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_FOR_MS);
  };

  return (
    <div>
      {/* On phones the button is a bar pinned to the bottom of the screen,
          over the text, in the mirror's own side gutters; from `md` up it
          sits at the head of the text. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-10 bg-ink px-[clamp(18px,5vw,24px)] pt-3 pb-[max(16px,env(safe-area-inset-bottom))]",
          "md:static md:bg-transparent md:p-0"
        )}
      >
        <button
          type="button"
          onClick={copy}
          className={cn(
            "w-full border px-3 py-3 font-mono text-[11px] tracking-[0.12em] text-paper transition-colors",
            DARK.rule,
            DARK.hover
          )}
        >
          <span aria-live="polite">
            {copied ? "✓ COPIED" : "⧉ COPY TO CLIPBOARD"}
          </span>
        </button>
      </div>

      <div ref={linesRef} className="font-mono text-xs leading-[1.75] md:mt-[22px]">
        {lines.map(({ prefix, text, className }, i) => (
          <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
            <span className={DARK.prefix}>{prefix}</span>
            <span className={className}>{text}</span>
            <span className={DARK.prefix} aria-hidden />
          </div>
        ))}
      </div>

      <p className={cn("mt-6 font-mono text-[11px]", DARK.quiet)}>
        Also served raw at{" "}
        <a href="/index.md" className={DARK.link}>
          /index.md
        </a>{" "}
        and{" "}
        <a href="/llms.txt" className={DARK.link}>
          /llms.txt
        </a>
        . Esc turns the TV back on.
      </p>
    </div>
  );
}
