"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TripPhoto } from "@/lib/trips";

// Shown under each photo while it loads, so empty cells read as intentional
// rather than broken.
const HATCH_LIGHT =
  "repeating-linear-gradient(45deg,#F1F1EB 0 7px,#E9E9E2 7px 14px)";

/**
 * Shared by the on-screen photo and the two it prefetches. It has to be
 * identical across them: the browser picks its srcset candidate from `sizes`,
 * so a mismatch here means the prefetch warms a URL the swap never asks for.
 */
const LIGHTBOX_SIZES = "(max-width: 980px) 84vw, 820px";

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

  // The neighbours to pull down while this photo is on screen, so ‹ / › swap to
  // something already decoded instead of starting a request. Deduped and
  // self-filtered, so a one- or two-photo trip doesn't prefetch what's showing.
  const prefetch = isOpen
    ? [
        (index - 1 + photos.length) % photos.length,
        (index + 1) % photos.length,
      ].filter((i, at, all) => i !== index && all.indexOf(i) === at)
    : [];

  const dialogRef = useRef<HTMLDivElement>(null);
  // The thumbnail that opened the lightbox. Closing hands focus back to it, so
  // a keyboard visitor resumes at the photo they were on instead of at the top
  // of the document.
  const openerRef = useRef<HTMLElement | null>(null);

  const open = (i: number) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setIndex(i);
  };

  const close = useCallback(() => setIndex(-1), []);
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i < 0 ? i : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );

  // Move focus into the dialog on open, and back to the opener on close. The
  // close branch is a no-op on first mount, when there is no opener yet.
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
    else openerRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key !== "Tab") return;

      // Keep Tab inside the dialog — the page behind it is still in the
      // document, and tabbing into content hidden under the overlay leaves
      // focus somewhere the visitor can't see.
      const stops = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!stops?.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
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
            type="button"
            onClick={() => open(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="group relative cursor-zoom-in overflow-hidden rounded-sm outline-none transition-[outline] hoverable:outline hoverable:outline-1 hoverable:outline-line-strong focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink"
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
              className="object-cover transition-transform duration-300 motion-safe:group-hoverable:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {isOpen ? (
        <div
          ref={dialogRef}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${city} photos`}
          tabIndex={-1}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[rgba(22,22,20,0.95)] px-6 py-12 outline-none"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-2 grid size-11 place-items-center text-[22px] leading-none text-[#B9B9B2] transition-colors hoverable:text-paper focus-visible:outline-paper"
          >
            ×
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center p-4 text-[28px] leading-none text-[#B9B9B2] transition-colors hoverable:text-paper focus-visible:outline-paper"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center p-4 text-[28px] leading-none text-[#B9B9B2] transition-colors hoverable:text-paper focus-visible:outline-paper"
          >
            ›
          </button>
          <Image
            onClick={(e) => e.stopPropagation()}
            src={current.src}
            width={current.width}
            height={current.height}
            alt={`${city} — photo ${index + 1}`}
            sizes={LIGHTBOX_SIZES}
            priority
            className="max-h-[72vh] w-[min(820px,84vw)] rounded-sm object-contain"
          />
          <div className="mt-4 font-mono text-xs text-[#B9B9B2]">
            {index + 1} / {photos.length}
          </div>

          {/*
            The neighbours, parked in a 0×0 clip so they cost no layout. Their
            one non-negotiable is `loading="eager"`: next/image is lazy by
            default, and a lazy image that never reaches the viewport never
            downloads — which is the whole of what's being asked for here.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-0 w-0 overflow-hidden"
          >
            {prefetch.map((i) => (
              <Image
                key={photos[i].src}
                src={photos[i].src}
                width={photos[i].width}
                height={photos[i].height}
                alt=""
                sizes={LIGHTBOX_SIZES}
                loading="eager"
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
