"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const className =
  "text-xs text-subtle no-underline transition-colors hover:text-ink";
const label = "← All experiments";

// The lab index carries its page number over to each experiment as `?page=N`,
// so going back lands on the page the experiment was listed on.
export default function BackToLab() {
  const page = useSearchParams().get("page");

  return (
    <Link
      href={page && page !== "1" ? `/lab?page=${page}` : "/lab"}
      className={className}
    >
      {label}
    </Link>
  );
}

// Rendered during prerender, before the client knows the query string.
export function BackToLabFallback() {
  return (
    <Link href="/lab" className={className}>
      {label}
    </Link>
  );
}
