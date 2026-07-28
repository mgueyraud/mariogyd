import Link from "next/link";
import { CSSProperties } from "react";
import type { Metadata } from "next";
import TripsMap from "@/components/trips/TripsMap";
import { TRIPS, shortDate } from "@/lib/trips";

export const metadata: Metadata = {
  title: "Trips — Mario Gueyraud",
  description: "Places I've been, and the photos my phone came home with.",
};

export default function Trips() {
  return (
    <>
      <header
        className="animate-enter flex items-baseline gap-3"
        style={{ "--stagger": 1 } as CSSProperties}
      >
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.01em]">
          Trips
        </h1>
        <span className="font-mono text-xs text-faint">{TRIPS.length}</span>
      </header>
      <p
        className="animate-enter mt-3.5 max-w-[52ch] text-subtle [text-wrap:pretty]"
        style={{ "--stagger": 2 } as CSSProperties}
      >
        I&apos;m not a photographer — just someone who travels a lot and takes
        photos on his phone. Hover a dot for a city, or scan the list below.
      </p>

      <div
        className="animate-enter mt-14"
        style={{ "--stagger": 3 } as CSSProperties}
      >
        <TripsMap />
      </div>

      <div
        className="animate-enter mt-16 flex flex-col"
        style={{ "--stagger": 4 } as CSSProperties}
      >
        {TRIPS.map((trip) => (
          <Link
            key={trip.slug}
            href={`/trips/${trip.slug}`}
            prefetch
            className="-mx-3.5 flex items-baseline gap-3 rounded-lg px-3.5 py-[11px] no-underline transition-colors hover:bg-hover"
          >
            <span className="text-sm font-[550]">{trip.city}</span>
            <span className="text-[13px] text-faint">{trip.country}</span>
            <span className="flex-1 -translate-y-1 border-b border-dotted border-line-strong" />
            <span className="font-mono text-xs tracking-[0.05em] text-faint">
              {shortDate(trip.date)}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
