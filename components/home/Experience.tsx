"use client";

import { useState } from "react";
import { ROLES } from "@/lib/experience";

export default function Experience() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [showOlder, setShowOlder] = useState(false);

  const visible = showOlder ? ROLES : ROLES.slice(0, 4);

  return (
    <section className="mt-[clamp(64px,12vw,96px)]">
      <h2 className="mb-[22px] font-mono text-[11px] font-normal tracking-[0.14em] text-faint">
        EXPERIENCE
      </h2>

      <div className="flex flex-col gap-1">
        {visible.map((r, i) => {
          const isOpen = !!open[i];
          return (
            <div
              key={`${r.company}-${r.years}`}
              onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
              className="grid cursor-pointer grid-cols-[clamp(72px,16vw,104px)_1fr] gap-[18px] rounded-lg -mx-3.5 px-3.5 py-3 transition-colors hover:bg-hover"
            >
              <div className="whitespace-nowrap pt-0.5 font-mono text-xs tracking-[0.05em] text-faint">
                {r.years}
              </div>
              <div>
                <div className="text-sm font-[550]">{r.company}</div>
                <div className="text-[13px] text-subtle">{r.role}</div>
                <div
                  className="grid transition-[grid-template-rows] [transition-duration:350ms] ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-subtle [text-wrap:pretty]">
                      {r.desc}
                    </p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-block text-xs text-subtle no-underline transition-colors hover:text-ink"
                    >
                      {r.site} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowOlder((v) => !v)}
        className="mt-3.5 border-b border-dotted border-line-strong font-mono text-xs text-faint transition-colors hover:border-ink hover:text-ink"
      >
        {showOlder ? "Show fewer" : "Show older"}
      </button>
    </section>
  );
}
