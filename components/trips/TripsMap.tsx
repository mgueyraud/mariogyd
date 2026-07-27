"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { createMap } from "svg-dotted-map";
import { play } from "cuelume";
import { DottedMap, type Marker } from "@/components/ui/dotted-map";
import { TRIPS } from "@/lib/trips";

const MAP_WIDTH = 165;
const MAP_HEIGHT = 75;
const MAP_SAMPLES = 7000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export default function TripsMap() {
  const markers = useMemo<Marker[]>(
    () => TRIPS.map((t) => ({ lat: t.lat, lng: t.lng, size: 0.9 })),
    []
  );

  // Project trips onto the same grid the dotted map uses (viewBox units).
  const { pins, origin } = useMemo(() => {
    const { addMarkers } = createMap({
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      mapSamples: MAP_SAMPLES,
    });
    const projected = addMarkers(TRIPS.map((t) => ({ lat: t.lat, lng: t.lng })));
    const pts = TRIPS.map((trip, i) => ({
      trip,
      x: projected[i].x,
      y: projected[i].y,
    }));
    // Zoom around the centroid of the trips (the Americas), not the canvas
    // center, so zooming keeps the markers in frame.
    const ox = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const oy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return { pins: pts, origin: { x: ox, y: oy } };
  }, []);

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
      const maxX = (MAP_WIDTH - origin.x) * z + origin.x - MAP_WIDTH;
      const minY = origin.y * (1 - z);
      const maxY = (MAP_HEIGHT - origin.y) * z + origin.y - MAP_HEIGHT;
      return { x: clamp(p.x, minX, maxX), y: clamp(p.y, minY, maxY) };
    },
    [origin]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      setZoom((z) => {
        const next = clamp(z * factor, MIN_ZOOM, MAX_ZOOM);
        setPan((p) => (next <= 1 ? { x: 0, y: 0 } : clampPan(p, next)));
        return next;
      });
    },
    [clampPan]
  );

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    const w = containerRef.current?.getBoundingClientRect().width ?? MAP_WIDTH;
    moved.current = false;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      unitsPerPx: MAP_WIDTH / w,
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

  const btn =
    "flex h-[26px] w-[26px] items-center justify-center rounded-md border border-[#E6E6DF] bg-paper text-sm leading-none text-subtle transition-colors hover:border-line-strong hover:text-ink disabled:opacity-40 disabled:hover:border-[#E6E6DF] disabled:hover:text-subtle";

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden aspect-[165/75]"
      style={{
        cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
        touchAction: zoom > 1 ? "none" : "auto",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <DottedMap
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        mapSamples={MAP_SAMPLES}
        stagger={false}
        dotColor="#D8D8CF"
        markers={markers}
        markerColor="#1C1C1A"
        pulse
        zoom={zoom}
        zoomOrigin={origin}
        pan={pan}
        className="absolute inset-0"
      />

      {pins.map(({ trip, x, y }) => {
        const zx = (x - origin.x) * zoom + origin.x;
        const zy = (y - origin.y) * zoom + origin.y;
        const left = ((zx - pan.x) / MAP_WIDTH) * 100;
        const top = ((zy - pan.y) / MAP_HEIGHT) * 100;
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
            className="group absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 outline-none"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 font-mono text-[11px] text-paper opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
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
