"use client";
import { alongTrack, useSlider } from "./context";

/*
 * Hash marks between the groups set by Slider.Root's `marks`. Faint at rest,
 * stronger on hover/focus/press, on the handle's timing.
 */
export function SliderMarks() {
  const { marks } = useSlider();

  return Array.from({ length: Math.max(0, marks - 1) }, (_, i) => (
    <div
      key={i}
      aria-hidden
      className="pointer-events-none absolute top-1/2 -z-10 h-(--slider-mark-height) w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--slider-mark) opacity-(--slider-mark-opacity) transition-opacity duration-(--slider-handle-duration) ease-(--slider-handle-ease) group-hover:opacity-(--slider-mark-hover-opacity) group-focus-visible:opacity-(--slider-mark-hover-opacity) group-data-[pressed]:opacity-(--slider-mark-hover-opacity) motion-reduce:transition-none"
      style={{ left: alongTrack(((i + 1) / marks) * 100) }}
    />
  ));
}
