import Link from "next/link";
import { getLabPostBySlug } from "../fetchers";
import { CgArrowLeft } from "react-icons/cg";

export default async function LabComponentPage({params}: {params: {slug: string}}) {

    const labPost = await getLabPostBySlug(params.slug);

    return (
        <article>
            <Link href="/lab" className="mb-8 flex items-center gap-2 w-fit">
                <CgArrowLeft />
                <span className="text-sm">Go Back</span>
            </Link>
            <h1 className="font-semibold mb-4">{labPost.frontmatter.title}</h1>
            {labPost.content}
        </article>
    )
}