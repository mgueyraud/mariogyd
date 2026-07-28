import { ImageResponse } from "next/og";
import { OgCard, contentType, loadFonts, size } from "@/lib/og";
import { TRIPS } from "@/lib/trips";

export const alt =
  "Trips — places I've been, and the photos my phone came home with";
export { size, contentType };

export default async function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Trips"
      title={"Places I’ve been"}
      meta={`${TRIPS.length} cities`}
    />,
    {
      ...size,
      fonts: await loadFonts(),
    }
  );
}
