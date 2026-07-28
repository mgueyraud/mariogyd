import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TRIPS, getTripBySlug, longDate } from "@/lib/trips";
import PhotoLightbox from "@/components/trips/PhotoLightbox";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRIPS.map((trip) => ({ slug: trip.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const trip = getTripBySlug(params.slug);
  if (!trip) return {};
  return {
    title: `${trip.city} — Trips — Mario Gueyraud`,
    description: trip.blurb,
  };
}

export default function TripDetail({ params }: { params: { slug: string } }) {
  const trip = getTripBySlug(params.slug);
  if (!trip) notFound();

  return (
    <article>
      <Link
        href="/trips"
        className="text-xs text-subtle no-underline transition-colors hover:text-ink"
      >
        ← All trips
      </Link>

      <header className="mt-[22px]">
        <h1 className="font-serif text-[34px] font-medium tracking-[-0.01em]">
          {trip.city}
        </h1>
        <div className="mt-2 font-mono text-xs tracking-[0.08em] text-faint">
          {longDate(trip.date)} · {trip.country.toUpperCase()} ·{" "}
          {trip.photos.length} PHOTOS
        </div>
      </header>

      <p className="mt-[22px] max-w-[52ch] text-subtle [text-wrap:pretty]">
        {trip.blurb}
      </p>

      <PhotoLightbox photos={trip.photos} city={trip.city} />
    </article>
  );
}
