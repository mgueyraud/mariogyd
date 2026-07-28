import Link from "next/link";
import { CSSProperties } from "react";
import { getLabMetaPage } from "./fetchers";
import Pagination from "@/components/custom/Pagination";
import LabVideo from "@/components/custom/LabVideo";

export const revalidate = 300;

export default function Lab({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams?.page;
  const pageNum = page ? Number(page) : 1;

  const { posts, numOfPages, total } = getLabMetaPage(pageNum);

  return (
    <>
      <header
        className="animate-enter flex items-baseline gap-3"
        style={{ "--stagger": 1 } as CSSProperties}
      >
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.01em]">
          Lab
        </h1>
        <span className="font-mono text-xs text-faint">{total}</span>
      </header>
      <p
        className="animate-enter mt-3.5 max-w-[52ch] text-subtle [text-wrap:pretty]"
        style={{ "--stagger": 2 } as CSSProperties}
      >
        A creative hub for UI experiments, component explorations, and
        interaction design.
      </p>

      <div className="mt-14 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[22px]">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/lab/${post.slug}`}
            prefetch
            aria-label={post.title}
            className="animate-enter block overflow-hidden rounded-lg border border-line transition-colors hover:border-line-strong"
            style={{ "--stagger": i + 3 } as CSSProperties}
          >
            <div className="aspect-[16/10] border-b border-line">
              <LabVideo src={post.video} />
            </div>
            <div className="px-3.5 pb-3.5 pt-3">
              <div className="text-[13px] font-[550]">{post.title}</div>
              <div className="mt-0.5 text-xs text-subtle">
                {post.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {numOfPages > 1 ? (
        <Pagination numOfPages={numOfPages} pageNum={pageNum} />
      ) : null}
    </>
  );
}
