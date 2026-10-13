"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "motion/react";
import { alongTrack, clamp, useSlider } from "./context";

type SliderHandleProps = {
  /** Keep the handle visible without hovering, for debugging its placement. */
  alwaysVisible?: boolean;
};

// The handle's center (it's translated -50%, so width grows from the middle),
// `gap` inside the fill's edge, and pinned `edgeGap` from either end.
const handleLeftAt = (percent: number) =>
  `clamp(calc(var(--slider-handle-width) / 2 + var(--slider-handle-edge-gap)), calc(${alongTrack(percent)} - var(--slider-handle-gap)), calc(100% - var(--slider-handle-width) / 2 - var(--slider-handle-edge-gap)))`;

const overlaps = (a: DOMRect, left: number, right: number) => a.left < right && a.right > left;

/*
 * A small pill riding just inside the fill's edge. Hidden at zero width; it
 * grows in on hover/focus, and while pressed (for touch).
 *
 * Anywhere from the track's start to the end of Slider.Label (or from
 * Slider.Value to the track's end) it dodges: lower opacity and a shorter
 * pill, so the text stays readable.
 */
export function SliderHandle({ alwaysVisible = false }: SliderHandleProps) {
  const context = useSlider();
  const { shown, percent, pressed, trackRef, labelRef, valueRef } = context;
  const left = useTransform(shown, (p) => handleLeftAt(clamp(p, 0, 100)));

  // The probe sits where the handle is headed (no animation), padded by the
  // dodge margin, so this reads the destination rather than a mid-slide frame.
  // `context` is a fresh object on every Root render (value, theme, zoom).
  // A passive effect, not a layout one: React attaches the track's ref (a
  // parent) and Label/Value's refs (later siblings) after this part's layout
  // effects run, so they'd still be null on mount.
  const probeRef = useRef<HTMLDivElement>(null);
  const [dodge, setDodge] = useState(false);
  useEffect(() => {
    const track = trackRef.current!.getBoundingClientRect();
    const probe = probeRef.current!.getBoundingClientRect();
    const labelEnd = labelRef.current?.getBoundingClientRect().right ?? track.left;
    const valueStart = valueRef.current?.getBoundingClientRect().left ?? track.right;
    setDodge(overlaps(probe, track.left, labelEnd) || overlaps(probe, valueStart, track.right));
  }, [context, trackRef, labelRef, valueRef]);

  return (
    <>
      <motion.div
        aria-hidden
        data-pressed={pressed || undefined}
        data-show={alwaysVisible || undefined}
        className="pointer-events-none absolute top-1/2 -z-10 h-(--slider-handle-height) w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--slider-handle) opacity-0 [scale:1_var(--handle-scale)] [transition:var(--handle-transition)] group-hover:w-(--slider-handle-width) group-hover:opacity-(--handle-opacity) group-focus-visible:w-(--slider-handle-width) group-focus-visible:opacity-(--handle-opacity) data-[pressed]:w-(--slider-handle-width) data-[pressed]:opacity-(--handle-opacity) data-[show]:w-(--slider-handle-width) data-[show]:opacity-(--handle-opacity) motion-reduce:transition-none"
        style={{
          // One opacity for every visible state, so states never fight over it.
          ["--handle-opacity" as string]: dodge
            ? "var(--slider-handle-dodge-opacity)"
            : pressed
              ? "var(--slider-handle-drag-opacity)"
              : "var(--slider-handle-opacity)",
          ["--handle-scale" as string]: dodge ? "var(--slider-handle-dodge-scale)" : "1",
          // Position rides Root's spring; width/opacity/scale use the
          // handle's own timing.
          ["--handle-transition" as string]: [
            "width var(--slider-handle-duration) var(--slider-handle-ease)",
            "opacity var(--slider-handle-duration) var(--slider-handle-ease)",
            "scale var(--slider-handle-duration) var(--slider-handle-ease)",
          ].join(", "),
          left,
        }}
      />
      <div
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 h-px w-[calc(var(--slider-handle-width)+2*var(--slider-handle-dodge-margin))] -translate-x-1/2"
        style={{ left: handleLeftAt(percent) }}
      />
    </>
  );
}
