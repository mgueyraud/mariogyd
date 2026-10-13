/*
 * A copy of the DialKit slider, as compound parts:
 *
 *   <Slider.Root defaultValue={64} format={(v) => `${v}%`}>
 *     <Slider.Fill />                 filled part of the track
 *     <Slider.Marks />                hash marks between groups
 *     <Slider.Handle />               pill at the fill's edge, on hover
 *     <Slider.Label>Opacity</Slider.Label>
 *     <Slider.Value />                formatted value
 *   </Slider.Root>
 *
 * Root owns the value and every interaction (context.ts is what it shares);
 * the parts only draw. Everything is themed through --slider-* variables.
 */
import { SliderFill } from "./SliderFill";
import { SliderHandle } from "./SliderHandle";
import { SliderMarks } from "./SliderMarks";
import { SliderRoot } from "./SliderRoot";
import { SliderLabel, SliderValue } from "./SliderText";

export const Slider = {
  Root: SliderRoot,
  Fill: SliderFill,
  Marks: SliderMarks,
  Handle: SliderHandle,
  Label: SliderLabel,
  Value: SliderValue,
};

export type { SliderRootProps } from "./SliderRoot";
