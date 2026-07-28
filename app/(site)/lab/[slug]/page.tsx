import Link from "next/link";
import { Suspense } from "react";
import { getAllLabMeta, getLabPostBySlug } from "../fetchers";
import BackToLab, { BackToLabFallback } from "@/components/custom/BackToLab";
import { GoArrowUpRight } from "react-icons/go";

// Next.js will invalidate the cache when a
// request comes in, at most once every 3600 seconds (1 hour).
export const revalidate = 3600;

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true;

export function generateStaticParams() {
  return getAllLabMeta().map((post) => ({ slug: post.slug }));
}

export default async function LabComponentPage({
  params,
}: {
  params: { slug: string };
}) {
  const labPost = await getLabPostBySlug(params.slug);

  return (
    <article>
      <Suspense fallback={<BackToLabFallback />}>
        <BackToLab />
      </Suspense>
      <h1 className="mt-5 mb-4 font-serif text-[30px] font-medium tracking-[-0.01em]">
        {labPost.frontmatter.title}
      </h1>
      {labPost.content}
      {labPost.frontmatter.githubLink ? (
        <div className="flex justify-end">
          <Link
            href={labPost.frontmatter.githubLink}
            target="_blank"
            className="flex items-center text-sm text-subtle underline decoration-line-strong underline-offset-[3px] hover:text-ink hover:decoration-ink"
          >
            <span>View source</span>
            <GoArrowUpRight className="relative top-[1.5px] text-faint" />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
