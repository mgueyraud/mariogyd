"use client";

import { useSearchParams } from "next/navigation";
import TextLink from "@/components/site/TextLink";

const LABEL = "← All experiments";

// The lab index carries its page number over to each experiment as `?page=N`,
// so going back lands on the page the experiment was listed on.
export default function BackToLab() {
  const page = useSearchParams().get("page");

  return (
    <TextLink
      href={page && page !== "1" ? `/lab?page=${page}` : "/lab"}
      className="text-xs"
    >
      {LABEL}
    </TextLink>
  );
}

// Rendered during prerender, before the client knows the query string.
export function BackToLabFallback() {
  return (
    <TextLink href="/lab" className="text-xs">
      {LABEL}
    </TextLink>
  );
}
