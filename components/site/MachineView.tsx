"use client";

import { useEffect, useRef, useState } from "react";
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

/** The mirror, set light-on-ink. Lives inside the ViewModeProvider's overlay. */
export default function MachineView({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

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

      <div className="mt-[22px] font-mono text-xs leading-[1.75]">
        {markdown.split("\n").map((line, i) => {
          const { prefix, text, className } = toneOf(line);
          return (
            <div key={i} className="min-h-[1.75em] whitespace-pre-wrap break-words">
              {prefix && <span className={DARK.prefix}>{prefix}</span>}
              <span className={className}>{text}</span>
            </div>
          );
        })}
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
