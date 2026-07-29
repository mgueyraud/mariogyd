import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/site/Reveal";
import TripsMap from "@/components/trips/TripsMap";
import { TRIPS, shortDate } from "@/lib/trips";
import { getMapGeometry } from "@/lib/trips-map";

export const metadata: Metadata = {
  title: "Trips — Mario Gueyraud",
  description: "Places I've been, and the photos my phone came home with.",
};

export default function Trips() {
  return (
    <>
      <Reveal step={1} as="header" className="flex items-baseline gap-3">
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.01em]">
          Trips
        </h1>
        <span className="font-mono text-xs text-faint">{TRIPS.length}</span>
      </Reveal>

      <Reveal
        step={2}
        as="p"
        className="mt-3.5 max-w-[52ch] text-subtle [text-wrap:pretty]"
      >
        I&apos;m not a photographer — just someone who travels a lot and takes
        photos on his phone. Press or hover a dot for a city, or scan the list
        below.
      </Reveal>

      <Reveal step={3} className="mt-14">
        <TripsMap geometry={getMapGeometry()} />
      </Reveal>

      <Reveal step={4} className="mt-16 flex flex-col">
        {TRIPS.map((trip) => (
          <Link
            key={trip.slug}
            href={`/trips/${trip.slug}`}
            prefetch
            className="-mx-3.5 flex min-h-11 items-baseline gap-3 rounded-lg px-3.5 py-[11px] no-underline transition-colors hoverable:bg-hover"
          >
            <span className="text-sm font-[550]">{trip.city}</span>
            <span className="text-[13px] text-faint">{trip.country}</span>
            <span className="flex-1 -translate-y-1 border-b border-dotted border-line-strong" />
            <span className="font-mono text-xs tracking-[0.05em] text-faint">
              {shortDate(trip.date)}
            </span>
          </Link>
        ))}
      </Reveal>
    </>
  );
}
