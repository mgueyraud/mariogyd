import { Suspense } from "react";
import type { Metadata } from "next";
import { GoArrowUpRight } from "react-icons/go";
import BackToLab, { BackToLabFallback } from "@/components/lab/BackToLab";
import TextLink from "@/components/site/TextLink";
import { getAllLabMeta } from "@/lib/lab-meta";
import { getLabPostBySlug } from "@/lib/lab";

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

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getAllLabMeta().find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Lab — Mario Gueyraud`,
    description: post.description,
  };
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
          <TextLink
            href={labPost.frontmatter.githubLink}
            target="_blank"
            variant="underline"
            className="flex items-center text-sm text-subtle hover:text-ink"
          >
            <span>View source</span>
            <GoArrowUpRight className="relative top-[1.5px] text-faint" />
          </TextLink>
        </div>
      ) : null}
    </article>
  );
}
