import Link from "next/link";
import { getAllLabPosts, getLabPostBySlug } from "../fetchers";
import { CgArrowLeft } from "react-icons/cg";
import { GoArrowUpRight } from "react-icons/go";

// Next.js will invalidate the cache when a
// request comes in, at most once every 3600 seconds (1 hour).
export const revalidate = 3600;

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { posts } = await getAllLabPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function LabComponentPage({
  params,
}: {
  params: { slug: string };
}) {
  const labPost = await getLabPostBySlug(params.slug);

  return (
    <article>
      <Link href="/lab" className="mb-8 flex items-center gap-2 w-fit">
        <CgArrowLeft />
        <span className="text-sm">Go Back</span>
      </Link>
      <h1 className="font-semibold mb-4">{labPost.frontmatter.title}</h1>
      {labPost.content}
      {labPost.frontmatter.githubLink ? (
        <div className="flex justify-end">
          <Link
            href={labPost.frontmatter.githubLink}
            target="_blank"
            className="underline text-sm flex items-center"
          >
            <span>View source</span>
            <GoArrowUpRight className="text-zinc-500 relative top-[1.5px]" />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
