"use client";
import { motion, useTransform } from "motion/react";
import { clamp, useSlider } from "./context";

/*
 * The filled part of the track, behind the label and value. Drawn full width
 * and clipped from the right, so the corner radius stays round at any size.
 */
export function SliderFill() {
  const { shown } = useSlider();
  // Clamped so a bouncy spring can't overshoot the track.
  const clipPath = useTransform(
    shown,
    (p) => `inset(0 ${100 - clamp(p, 0, 100)}% 0 0 round var(--slider-fill-radius))`,
  );

  return (
    <motion.div
      aria-hidden
      className="absolute inset-(--slider-fill-inset) -z-10 bg-(--slider-fill) group-hover:bg-(--slider-fill-hover)"
      style={{ clipPath }}
    />
  );
}
