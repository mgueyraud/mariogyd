"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Pagination({
  pageNum,
  numOfPages,
}: {
  pageNum: number;
  numOfPages: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (pageNum > 1) router.prefetch(`/lab?page=${pageNum - 1}`);
    if (pageNum < numOfPages) router.prefetch(`/lab?page=${pageNum + 1}`);
  }, [pageNum, numOfPages, router]);

  const hasPrev = pageNum > 1;
  const hasNext = pageNum < numOfPages;

  return (
    <div className="mt-10 flex items-center gap-3.5 font-mono text-xs tracking-[0.05em] text-faint">
      {hasPrev ? (
        <Link
          href={`?page=${pageNum - 1}`}
          scroll={false}
          className="text-subtle no-underline transition-colors hover:text-ink"
        >
          ‹ PREV
        </Link>
      ) : null}
      <span>
        PAGE {pageNum} / {numOfPages}
      </span>
      <span className="flex-1 border-b border-dotted border-line-strong" />
      {hasNext ? (
        <Link
          href={`?page=${pageNum + 1}`}
          scroll={false}
          className="text-subtle no-underline transition-colors hover:text-ink"
        >
          NEXT ›
        </Link>
      ) : null}
    </div>
  );
}
