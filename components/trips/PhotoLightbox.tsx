"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { TripPhoto } from "@/lib/trips";

// Shown under each photo while it loads, so empty cells read as intentional
// rather than broken.
const HATCH_LIGHT =
  "repeating-linear-gradient(45deg,#F1F1EB 0 7px,#E9E9E2 7px 14px)";

export default function PhotoLightbox({
  photos,
  city,
}: {
  photos: TripPhoto[];
  city: string;
}) {
  const [index, setIndex] = useState(-1);

  const isOpen = index >= 0;
  const current = photos[index >= 0 ? index : 0];

  const close = useCallback(() => setIndex(-1), []);
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i < 0 ? i : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, step]);

  return (
    <>
      <div className="mt-14 grid grid-cols-2 gap-[clamp(10px,2vw,14px)]">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            onClick={() => setIndex(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="group relative cursor-zoom-in overflow-hidden rounded-sm outline-none transition-[outline] hover:outline hover:outline-1 hover:outline-line-strong focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink"
            style={{
              gridColumn: `span ${photo.span}`,
              // Single-column cells share one 3:4 box so a row never goes
              // ragged when a photo isn't the usual portrait shape. Full-width
              // cells have no row partner, so they keep their true ratio.
              aspectRatio:
                photo.span === 2 ? `${photo.width} / ${photo.height}` : "3 / 4",
              background: HATCH_LIGHT,
            }}
          >
            <Image
              src={photo.src}
              fill
              alt={`${city} — photo ${i + 1}`}
              sizes={
                photo.span === 2
                  ? "(max-width: 640px) 92vw, 600px"
                  : "(max-width: 640px) 46vw, 293px"
              }
              priority={i < 2}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {isOpen ? (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${city} photos`}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[rgba(22,22,20,0.95)] px-6 py-12"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-6 top-5 text-[22px] leading-none text-[#B9B9B2] transition-colors hover:text-paper"
          >
            ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-[28px] text-[#B9B9B2] transition-colors hover:text-paper"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-[28px] text-[#B9B9B2] transition-colors hover:text-paper"
          >
            ›
          </button>
          <Image
            onClick={(e) => e.stopPropagation()}
            src={current.src}
            width={current.width}
            height={current.height}
            alt={`${city} — photo ${index + 1}`}
            sizes="(max-width: 980px) 84vw, 820px"
            className="max-h-[72vh] w-[min(820px,84vw)] rounded-sm object-contain"
          />
          <div className="mt-4 font-mono text-xs text-[#B9B9B2]">
            {index + 1} / {photos.length}
          </div>
        </div>
      ) : null}
    </>
  );
}
