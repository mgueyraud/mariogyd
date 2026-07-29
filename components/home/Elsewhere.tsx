import type { ReactNode } from "react";
import { linkStyles, tapTarget } from "@/components/site/TextLink";
import { cn } from "@/lib/utils";

type ElsewhereLink = {
  href: string;
  label: string;
  /** Accessible name, and the React key. */
  aria: string;
  rel?: string;
  target?: string;
  icon: ReactNode;
};

const LINKS: ElsewhereLink[] = [
  {
    href: "https://github.com/mgueyraud",
    label: "mgueyraud",
    aria: "GitHub",
    rel: "me noopener",
    icon: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    href: "https://twitter.com/mariogyd",
    label: "@mariogyd",
    aria: "X (Twitter)",
    rel: "me noopener",
    icon: (
      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/mariogyd/",
    label: "mariogyd",
    aria: "LinkedIn",
    rel: "me noopener",
    icon: (
      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "mailto:mgueyraud.junior@gmail.com",
    label: "email",
    aria: "Email",
    icon: (
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7.5l9 6 9-6" />
      </svg>
    ),
  },
  {
    href: "/resume.pdf",
    label: "resume",
    aria: "Resume PDF",
    target: "_blank",
    icon: (
      <svg
        width={13}
        height={13}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
];

export default function Elsewhere() {
  return (
    <section className="mt-[clamp(64px,12vw,96px)]">
      <h2 className="mb-5 font-mono text-[11px] font-normal tracking-[0.14em] text-faint">
        ELSEWHERE
      </h2>
      {/* gap-y clears the 44px tap targets so stacked rows can't overlap them. */}
      <div className="flex flex-wrap gap-x-6 gap-y-6">
        {LINKS.map(({ href, label, aria, rel, target, icon }) => (
          <a
            key={aria}
            href={href}
            rel={rel}
            target={target}
            aria-label={aria}
            className={cn(
              "inline-flex items-center gap-[7px] text-[13px]",
              linkStyles.muted,
              tapTarget
            )}
          >
            {icon}
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
