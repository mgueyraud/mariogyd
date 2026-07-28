import Link from "next/link";
import type { Metadata } from "next";
import LabVideo from "@/components/lab/LabVideo";
import Pagination from "@/components/lab/Pagination";
import Reveal from "@/components/site/Reveal";
import { getLabMetaPage } from "@/lib/lab-meta";

export const metadata: Metadata = {
  title: "Lab — Mario Gueyraud",
  description:
    "A creative hub for UI experiments, component explorations, and interaction design.",
};

// Reading `searchParams` opts this segment into dynamic rendering, so there is
// no revalidate window to set — every request renders. The only work is
// reading the MDX frontmatter, which getAllLabMeta() memoizes per request.
export default function Lab({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams?.page;
  const pageNum = page ? Number(page) : 1;

  const { posts, numOfPages, total } = getLabMetaPage({ page: pageNum });

  return (
    <>
      <Reveal step={1} as="header" className="flex items-baseline gap-3">
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.01em]">
          Lab
        </h1>
        <span className="font-mono text-xs text-faint">{total}</span>
      </Reveal>

      <Reveal
        step={2}
        as="p"
        className="mt-3.5 max-w-[52ch] text-subtle [text-wrap:pretty]"
      >
        A creative hub for UI experiments, component explorations, and
        interaction design.
      </Reveal>

      <div className="mt-14 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[22px]">
        {posts.map((post, i) => (
          <Reveal key={post.slug} step={i + 3}>
            <Link
              href={
                pageNum > 1
                  ? `/lab/${post.slug}?page=${pageNum}`
                  : `/lab/${post.slug}`
              }
              prefetch
              aria-label={post.title}
              className="block overflow-hidden rounded-lg border border-line transition-colors hover:border-line-strong"
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
          </Reveal>
        ))}
      </div>

      {numOfPages > 1 ? (
        <Pagination numOfPages={numOfPages} pageNum={pageNum} />
      ) : null}
    </>
  );
}
