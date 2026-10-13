"use client";
import { createContext, useContext, type RefObject } from "react";
import type { MotionValue } from "motion/react";

/*
 * What Slider.Root shares with its parts. Root owns the value and every
 * interaction; the parts only read this and draw.
 */
export type SliderContextValue = {
  value: number;
  min: number;
  max: number;
  /** Target position, 0–100. Jumps straight to the new value. */
  percent: number;
  /** Animated position, 0–100. Springs toward `percent` (1:1 while dragging). */
  shown: MotionValue<number>;
  valueText: string;
  /** Number of equal groups the marks divide the track into. */
  marks: number;
  pressed: boolean;
  trackRef: RefObject<HTMLDivElement>;
  labelRef: RefObject<HTMLSpanElement>;
  valueRef: RefObject<HTMLSpanElement>;
  labelId: string;
};

export const SliderContext = createContext<SliderContextValue | null>(null);

export function useSlider() {
  const context = useContext(SliderContext);
  if (!context) throw new Error("Slider parts must be rendered inside <Slider.Root>.");
  return context;
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Where a point `percent` of the way along sits inside the fill area, so the
 * fill, marks and handle all line up when the fill has an inset.
 */
export const alongTrack = (percent: number) =>
  `calc(var(--slider-fill-inset) + (100% - 2 * var(--slider-fill-inset)) * ${percent / 100})`;
