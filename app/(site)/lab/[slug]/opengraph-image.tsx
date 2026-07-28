import { ImageResponse } from "next/og";
import { OgCard, contentType, loadFonts, size } from "@/lib/og";
import { getAllLabMeta } from "@/lib/lab-meta";

export const alt = "Lab experiment by Mario Gueyraud";
export { size, contentType };

export function generateStaticParams() {
  return getAllLabMeta().map((post) => ({ slug: post.slug }));
}

/** "9/15/2024" → "SEP 15, 2024", to match the mono labels used across the site. */
function formatDate(publishedDate: string) {
  const date = new Date(publishedDate);
  if (Number.isNaN(date.getTime())) return undefined;

  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getAllLabMeta().find((p) => p.slug === params.slug);

  return new ImageResponse(
    <OgCard
      eyebrow="Lab"
      title={post?.title ?? "Lab"}
      meta={post ? formatDate(post.publishedDate) : undefined}
    />,
    {
      ...size,
      fonts: await loadFonts(),
    }
  );
}
