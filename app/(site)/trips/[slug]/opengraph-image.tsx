import { ImageResponse } from "next/og";
import { OgCard, contentType, loadFonts, size } from "@/lib/og";
import { TRIPS, getTripBySlug, longDate } from "@/lib/trips";

export const alt = "A trip, by Mario Gueyraud";
export { size, contentType };

export function generateStaticParams() {
  return TRIPS.map((trip) => ({ slug: trip.slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const trip = getTripBySlug(params.slug);

  return new ImageResponse(
    <OgCard
      eyebrow="Trips"
      title={trip?.city ?? "Trips"}
      meta={
        trip ? `${longDate(trip.date)} · ${trip.country.toUpperCase()}` : undefined
      }
    />,
    {
      ...size,
      fonts: await loadFonts(),
    }
  );
}
