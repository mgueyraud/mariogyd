"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { play } from "cuelume";
import { DottedMap, type Marker } from "@/components/ui/dotted-map";
// Type-only — importing a value from lib/trips-map would drag the map sampler
// (and its world data) into this client bundle.
import type { MapGeometry } from "@/lib/trips-map";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * `geometry` is sampled and projected on the server — one pin per city, repeat
 * visits pointing at the most recent trip. Everything here is view state.
 */
export default function TripsMap({ geometry }: { geometry: MapGeometry }) {
  const { width, height, grid, dots, pins, origin } = geometry;

  const markers = useMemo<Marker[]>(
    () => pins.map((p) => ({ x: p.x, y: p.y, size: 0.9 })),
    [pins],
  );

  // The pin pulse is SMIL (<animate>), which CSS media queries can't reach —
  // it has to be switched off from JS.
  const reducedMotion = useReducedMotion();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
    unitsPerPx: number;
  } | null>(null);
  const moved = useRef(false);

  // Keep the viewBox window within the (zoomed) spread of dots.
  const clampPan = useCallback(
    (p: { x: number; y: number }, z: number) => {
      const minX = origin.x * (1 - z);
      const maxX = (width - origin.x) * z + origin.x - width;
      const minY = origin.y * (1 - z);
      const maxY = (height - origin.y) * z + origin.y - height;
      return { x: clamp(p.x, minX, maxX), y: clamp(p.y, minY, maxY) };
    },
    [origin, width, height],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      setZoom((z) => {
        const next = clamp(z * factor, MIN_ZOOM, MAX_ZOOM);
        setPan((p) => (next <= 1 ? { x: 0, y: 0 } : clampPan(p, next)));
        return next;
      });
    },
    [clampPan],
  );

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    const w = containerRef.current?.getBoundingClientRect().width ?? width;
    moved.current = false;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      unitsPerPx: width / w,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) * d.unitsPerPx;
    const dy = (e.clientY - d.y) * d.unitsPerPx;
    if (Math.abs(e.clientX - d.x) > 3 || Math.abs(e.clientY - d.y) > 3)
      moved.current = true;
    // Drag right → reveal content to the left → viewBox origin moves left.
    setPan(clampPan({ x: d.panX - dx, y: d.panY - dy }, zoom));
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  // 26px reads right next to the map but is untappable, so the buttons grow to
  // 44px on a coarse pointer instead of being padded out everywhere.
  const btn =
    "flex h-[26px] w-[26px] coarse:h-11 coarse:w-11 items-center justify-center rounded-md border border-[#E6E6DF] bg-paper text-sm leading-none text-subtle transition-colors hoverable:border-line-strong hoverable:text-ink disabled:opacity-40 disabled:hoverable:border-[#E6E6DF] disabled:hoverable:text-subtle";

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${width} / ${height}`,
        cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
        touchAction: zoom > 1 ? "none" : "auto",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <DottedMap
        width={width}
        height={height}
        dots={dots}
        grid={grid}
        // The sampled lattice has a ~1.35-unit pitch, so r=0.4 fills a little
        // over half a cell — the continents read as solid landmass while the
        // gaps keep the dotted texture.
        dotColor="#CACAC0"
        dotRadius={0.33}
        markers={markers}
        markerColor="#1C1C1A"
        pulse={!reducedMotion}
        role="img"
        aria-label={`Dotted world map with ${pins.length} cities marked`}
        zoom={zoom}
        zoomOrigin={origin}
        pan={pan}
        className="absolute inset-0"
      />

      {pins.map((trip) => {
        const zx = (trip.x - origin.x) * zoom + origin.x;
        const zy = (trip.y - origin.y) * zoom + origin.y;
        const left = ((zx - pan.x) / width) * 100;
        const top = ((zy - pan.y) / height) * 100;
        if (left < 0 || left > 100 || top < 0 || top > 100) return null;
        return (
          <Link
            key={trip.slug}
            href={`/trips/${trip.slug}`}
            aria-label={`${trip.city}, ${trip.country}`}
            onMouseEnter={() => play("tick")}
            onClick={(e) => {
              if (moved.current) e.preventDefault();
            }}
            // The visible pin is drawn in the SVG underneath; this is only the
            // hotspot, so it can grow to a thumb-sized 44px on touch without
            // changing how the map looks.
            className="group absolute z-10 h-4 w-4 coarse:h-11 coarse:w-11 -translate-x-1/2 -translate-y-1/2 outline-none"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {/* group-active covers touch: press and hold names the city before
                the tap lands, since a thumb never gets the hover reveal. */}
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 font-mono text-[11px] text-paper opacity-0 transition-opacity duration-150 group-hoverable:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100">
              {trip.city}, {trip.country}
            </span>
          </Link>
        );
      })}

      {/* controls */}
      <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            play("press");
            zoomBy(1.7);
          }}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={btn}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            play("press");
            zoomBy(1 / 1.7);
          }}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={btn}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => {
            play("press");
            reset();
          }}
          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
          aria-label="Reset zoom"
          className={`${btn} text-xs`}
        >
          ⌂
        </button>
      </div>
    </div>
  );
}
