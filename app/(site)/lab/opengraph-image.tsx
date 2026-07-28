import { ImageResponse } from "next/og";
import { OgCard, contentType, loadFonts, size } from "@/lib/og";
import { getAllLabMeta } from "@/lib/lab-meta";

export const alt = "Lab — UI experiments and interaction design";
export { size, contentType };

export default async function Image() {
  const total = getAllLabMeta().length;

  return new ImageResponse(
    <OgCard
      eyebrow="Lab"
      title={"UI experiments & interaction design"}
      meta={`${total} experiments`}
    />,
    {
      ...size,
      fonts: await loadFonts(),
    }
  );
}
