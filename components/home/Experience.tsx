"use client";

import { useState } from "react";
import TextLink from "@/components/site/TextLink";
import type { Role } from "@/lib/experience";

/**
 * Stable across the "Show older" toggle, unlike the array index, and safe to
 * put in an id — company and years both contain spaces and punctuation.
 */
const roleId = (role: Role) =>
  `${role.company}-${role.years}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

export default function Experience({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [showOlder, setShowOlder] = useState(false);

  const visible = showOlder ? roles : roles.slice(0, 4);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <section className="mt-[clamp(64px,12vw,96px)]">
      <h2 className="mb-[22px] font-mono text-[11px] font-normal tracking-[0.14em] text-faint">
        EXPERIENCE
      </h2>

      <div className="flex flex-col gap-1">
        {visible.map((r) => {
          const id = roleId(r);
          const isOpen = open.has(id);
          return (
            <div
              key={id}
              className="-mx-3.5 rounded-lg px-3.5 py-3 transition-colors hover:bg-hover"
            >
              {/*
                A real button, so the row is reachable by keyboard. The company
                link sits outside it — nesting an anchor inside a button is
                invalid, and it's what forced the old stopPropagation.
              */}
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
                aria-controls={`role-${id}`}
                className="grid w-full grid-cols-1 gap-0.5 text-left sm:grid-cols-[104px_1fr] sm:gap-[18px]"
              >
                <span className="whitespace-nowrap font-mono text-xs tracking-[0.05em] text-faint sm:pt-0.5">
                  {r.years}
                </span>
                <span className="block">
                  <span className="block text-sm font-[550]">{r.company}</span>
                  <span className="block text-[13px] text-subtle">
                    {r.role}
                  </span>
                </span>
              </button>

              <div
                id={`role-${id}`}
                className="grid grid-cols-1 transition-[grid-template-rows] [transition-duration:350ms] ease-in-out sm:grid-cols-[104px_1fr] sm:gap-x-[18px]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                {/* Spacer aligning the body with the company column — only exists
                    at sm+, since a second child would split the animated row. */}
                <div aria-hidden className="hidden sm:block" />
                <div className="min-h-0 overflow-hidden">
                  <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-subtle [text-wrap:pretty]">
                    {r.desc}
                  </p>
                  <TextLink
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isOpen ? undefined : -1}
                    className="mt-2 inline-block text-xs"
                  >
                    {r.site} ↗
                  </TextLink>
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
