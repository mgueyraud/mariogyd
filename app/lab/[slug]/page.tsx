import Link from "next/link";
import { getLabPostBySlug } from "../fetchers";
import { CgArrowLeft } from "react-icons/cg";
import { GoArrowUpRight } from "react-icons/go";

export const revalidate = 3600;

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
