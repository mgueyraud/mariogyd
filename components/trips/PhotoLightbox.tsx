"use client";

import { useCallback, useEffect, useState } from "react";
import type { TripPhoto } from "@/lib/trips";

const HATCH_LIGHT =
  "repeating-linear-gradient(45deg,#F1F1EB 0 7px,#E9E9E2 7px 14px)";
const HATCH_DARK =
  "repeating-linear-gradient(45deg,#2A2A27 0 7px,#242422 7px 14px)";

export default function PhotoLightbox({ photos }: { photos: TripPhoto[] }) {
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
      <div className="mt-14 grid grid-cols-2 gap-3.5">
        {photos.map((photo, i) => (
          <button
            key={photo.caption}
            onClick={() => setIndex(i)}
            aria-label={`Open photo: ${photo.caption}`}
            className="flex cursor-zoom-in items-center justify-center rounded-sm outline-none transition-[outline] hover:outline hover:outline-1 hover:outline-line-strong focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink"
            style={{
              gridColumn: `span ${photo.span}`,
              aspectRatio: photo.ar,
              background: HATCH_LIGHT,
            }}
          >
            <span className="px-3 text-center font-mono text-[10px] text-faint">
              {photo.caption}
            </span>
          </button>
        ))}
      </div>

      {isOpen ? (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[72vh] w-[min(820px,84vw)] items-center justify-center rounded-sm"
            style={{ aspectRatio: current.ar, background: HATCH_DARK }}
          >
            <span className="font-mono text-[11px] text-[#8A8A82]">
              {current.caption}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-3.5 font-mono text-xs text-[#B9B9B2]">
            <span>{current.caption}</span>
            <span className="text-subtle">
              {index + 1} / {photos.length}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
