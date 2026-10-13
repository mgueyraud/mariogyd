"use client";
import type { ReactNode } from "react";
import { useSlider } from "./context";

/*
 * The two text slots. The track lays them out at either end (flex,
 * justify-between) on top of the fill, and Slider.Handle dodges around them.
 */

/** Left-aligned name; it's also the slider's accessible name. */
export function SliderLabel({ children }: { children: ReactNode }) {
  const { labelRef, labelId } = useSlider();
  return (
    <span ref={labelRef} id={labelId} className="text-[13px] leading-none font-medium">
      {children}
    </span>
  );
}

/** Right-aligned current value, formatted by Slider.Root's `format`. */
export function SliderValue() {
  const { valueRef, valueText } = useSlider();
  return (
    <span ref={valueRef} aria-hidden className="text-[13px] leading-none tabular-nums">
      {valueText}
    </span>
  );
}
