"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { linkStyles, tapTarget } from "@/components/site/TextLink";
import { ViewModeToggle } from "@/components/site/ViewMode";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/lab", label: "Lab" },
  { href: "/trips", label: "Trips" },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="mb-[clamp(56px,10vw,84px)] flex items-center justify-between gap-5 text-[13px]">
      <div className="flex gap-5">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            prefetch
            className={cn(
              tapTarget,
              isActive(href) ? "text-ink no-underline" : linkStyles.muted
            )}
            aria-current={isActive(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </div>
      <ViewModeToggle />
    </nav>
  );
}
