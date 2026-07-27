"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav className="flex gap-5 text-[13px] mb-[84px]">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          prefetch
          className={
            isActive(href)
              ? "text-ink no-underline"
              : "text-subtle no-underline transition-colors hover:text-ink"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
