import Link from "next/link";
import { getLabPosts } from "./fetchers";
import LabVideo from "@/components/custom/LabVideo";
import { CSSProperties } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";

export default async function Lab({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams?.page;
  const pageNum = page ? Number(page) : 1;

  const { posts, numOfPages } = await getLabPosts(pageNum);

  return (
    <>
      <h1
        className="font-semibold animate-enter"
        style={{ "--stagger": 1 } as CSSProperties}
      >
        Lab
      </h1>
      <p
        className="font-light mt-2 text-gray-300 animate-enter"
        style={{ "--stagger": 2 } as CSSProperties}
      >
        A creative hub for UI experiments, component explorations, and
        interaction design. Discover innovative ideas and cutting-edge
        techniques that push the boundaries of digital experiences.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`lab/${post.slug}`}
            aria-label={post.frontmatter.title}
            className="block aspect-square focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white animate-enter"
            style={{ "--stagger": i + 3 } as CSSProperties}
          >
            <LabVideo src={post.frontmatter.video} />
          </Link>
        ))}
      </div>
      {numOfPages > 1 ? (
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
      ) : null}
    </>
  );
}
