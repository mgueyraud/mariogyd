import { getLabPostBySlug } from "../fetchers";

export default async function LabComponentPage({params}: {params: {slug: string}}) {

    const labPost = await getLabPostBySlug(params.slug);

    return (
        <article>{labPost.content}</article>
    )
}