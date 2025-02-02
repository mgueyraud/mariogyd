"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function Pagination({
  pageNum,
  numOfPages,
}: {
  pageNum: number;
  numOfPages: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (pageNum > 1) {
      router.prefetch(`/lab?page=${pageNum - 1}`);
    }
    if (pageNum < numOfPages) {
      router.prefetch(`/lab?page=${pageNum + 1}`);
    }
  }, [pageNum, numOfPages, router]);

  return (
    <div className="flex justify-center items-center mt-14 gap-3">
      <Link
        href={`?page=${pageNum - 1}`}
        className="rounded-md px-1 py-2 bg-zinc-800 aria-disabled:pointer-events-none aria-disabled:opacity-55"
        aria-disabled={pageNum - 1 < 1}
      >
        <MdKeyboardArrowLeft />
      </Link>

      <span className="text-xs">
        {pageNum} / {numOfPages}
      </span>

      <Link
        href={`?page=${pageNum + 1}`}
        className="rounded-md px-1 py-2 bg-zinc-800 aria-disabled:pointer-events-none aria-disabled:opacity-55"
        aria-disabled={pageNum + 1 > numOfPages}
      >
        <MdKeyboardArrowRight />
      </Link>
    </div>
  );
}
