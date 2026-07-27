"use client";

import Link from "next/link";
import { useState } from "react";
import { TRIPS } from "@/lib/trips";

const HATCH =
  "repeating-linear-gradient(45deg,#F1F1EB 0 6px,#E9E9E2 6px 12px)";

export default function TripsFan() {
  const [hovered, setHovered] = useState(-1);

  return (
    <div
      onMouseLeave={() => setHovered(-1)}
      className="relative flex min-h-[170px] items-center pl-[26px] pt-11 pb-[26px]"
    >
      {TRIPS.map((trip, i) => {
        const isHovered = hovered === i;
        let transform: string;
        if (isHovered) {
          transform = "translateY(-16px) rotate(0deg) scale(1.08)";
        } else {
          const away = hovered < 0 ? 0 : i < hovered ? -20 : 20;
          transform = `translateX(${away}px) rotate(${trip.rotation}deg)`;
        }

        return (
          <Link
            key={trip.slug}
            href={`/trips/${trip.slug}`}
            onMouseEnter={() => setHovered(i)}
            aria-label={trip.city}
            className="relative -ml-[42px] block w-[106px] flex-none bg-white px-[7px] pt-[7px] pb-6 no-underline shadow-[0_1px_3px_rgba(28,28,26,0.14),0_10px_24px_rgba(28,28,26,0.07)]"
            style={{
              transform,
              zIndex: isHovered ? 20 : i + 1,
              transition: "transform 0.3s cubic-bezier(0.2,0.7,0.3,1)",
            }}
          >
            <span
              className="pointer-events-none absolute -top-[30px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-[3px] font-mono text-[11px] text-paper transition-opacity duration-150"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              {trip.city.toLowerCase()}
            </span>
            <span
              className="flex h-[92px] items-center justify-center font-mono text-[9px] text-faint"
              style={{ background: HATCH }}
            >
              photo
            </span>
          </Link>
        );
      })}
    </div>
  );
}
