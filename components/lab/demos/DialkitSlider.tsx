"use client";
import type { CSSProperties } from "react";
import { DialRoot, useDialKit, type DialConfig, type TransitionConfig } from "dialkit";
import "dialkit/styles.css";
import type { ValueAnimationTransition } from "motion/react";
import ComponentWrapper from "../ComponentWrapper";
import { Slider } from "./slider";

/*
 * A copy of the slider in Josh Puckett's DialKit panel. Colors are DialKit's
 * own dark theme: track = surface, fill = surface-active, hover fill =
 * border-hover, text = text-label, handle = text-primary.
 *
 * Every value is a DialKit control. The panel only shows in development
 * (DialKit's default); in production the defaults below are what renders.
 */
const CONFIG = {
  width: [280, 160, 480, 1],
  height: [40, 24, 64, 1],
  radius: [8, 0, 32, 1],
  padding: [12, 4, 24, 1],
  // How the fill and handle travel to a clicked value.
  spring: { type: "spring", visualDuration: 0.3, bounce: 0.2 },
  track: "rgba(255, 255, 255, 0.05)",
  fill: {
    color: "rgba(255, 255, 255, 0.11)",
    hoverColor: "rgba(255, 255, 255, 0.15)",
    radius: [8, 0, 32, 1],
    // Gap between fill and track. For concentric corners use
    // fill radius = track radius - inset.
    inset: [0, 0, 8, 0.5],
  },
  text: "rgba(255, 255, 255, 0.7)",
  // Rubber band past either end while dragging: nothing for the first
  // `deadZone` px, then the track stretches toward `limit` px.
  stretch: {
    deadZone: [25, 0, 80, 1],
    limit: [5, 0, 60, 1],
    // Snap-back on release (expo out, no overshoot).
    release: { type: "easing", duration: 0.4, ease: [0.19, 1, 0.22, 1] },
  },
  // Hash marks: `groups` equal sections (groups - 1 marks). Faint at rest,
  // stronger on hover, on the handle's transition.
  marks: {
    groups: [10, 0, 20, 1],
    height: [8, 2, 24, 1],
    color: "rgba(255, 255, 255, 0.15)",
    opacity: [0.4, 0, 1, 0.05],
    hoverOpacity: [1, 0, 1, 0.05],
    // Clicks within ± this many units of a mark (or an end) land on it.
    // Drags are never snapped. 0 turns it off.
    snap: [3, 0, 10, 0.5],
  },
  handle: {
    alwaysShow: false,
    width: [2.5, 1, 8, 0.5],
    height: [20, 4, 48, 1],
    gap: [7, 0, 16, 1],
    // How close it gets to either end of the track once clamped.
    edgeGap: [5, 0, 16, 0.5],
    // Fade + width when the handle appears. Ease-in: starts slow, finishes
    // fast. The slide along the track uses `spring`.
    transition: { type: "easing", duration: 0.15, ease: [0.55, 0, 1, 0.45] },
    // Shown at 50% on hover and 90% while dragging.
    color: "rgba(255, 255, 255, 0.95)",
    opacity: [0.5, 0, 1, 0.05],
    dragOpacity: [0.9, 0, 1, 0.05],
    // From either end of the track to the inner edge of the label/value,
    // fade and shorten so the text stays readable.
    dodgeOpacity: [0.15, 0, 1, 0.05],
    dodgeScale: [0.75, 0.25, 1, 0.05],
    dodgeMargin: [4, 0, 16, 1],
  },
} satisfies DialConfig;

// DialKit's editor can switch a curve to spring mode, which plain CSS can't
// express; fall back to its visual duration with a stock ease-in.
function toCssTiming(t: TransitionConfig) {
  return t.type === "easing"
    ? { duration: t.duration, ease: `cubic-bezier(${t.ease.join(", ")})` }
    : { duration: t.visualDuration ?? 0.3, ease: "ease-in" };
}

// DialKit's editor can switch a spring to a Bézier curve, which it calls
// `easing` and motion calls `tween`.
function toMotionTransition(t: TransitionConfig): ValueAnimationTransition<number> {
  return t.type === "easing" ? { type: "tween", duration: t.duration, ease: t.ease } : t;
}

export default function DialkitSlider() {
  const p = useDialKit("Slider", CONFIG);

  const vars = {
    "--slider-width": `${p.width}px`,
    "--slider-height": `${p.height}px`,
    "--slider-radius": `${p.radius}px`,
    "--slider-padding": `${p.padding}px`,
    "--slider-track": p.track,
    "--slider-fill": p.fill.color,
    "--slider-fill-hover": p.fill.hoverColor,
    "--slider-fill-radius": `${p.fill.radius}px`,
    "--slider-fill-inset": `${p.fill.inset}px`,
    "--slider-text": p.text,
    "--slider-release-duration": `${toCssTiming(p.stretch.release).duration}s`,
    "--slider-release-ease": toCssTiming(p.stretch.release).ease,
    "--slider-mark": p.marks.color,
    "--slider-mark-height": `${p.marks.height}px`,
    "--slider-mark-opacity": p.marks.opacity,
    "--slider-mark-hover-opacity": p.marks.hoverOpacity,
    "--slider-handle": p.handle.color,
    "--slider-handle-opacity": p.handle.opacity,
    "--slider-handle-drag-opacity": p.handle.dragOpacity,
    "--slider-handle-dodge-opacity": p.handle.dodgeOpacity,
    "--slider-handle-dodge-scale": p.handle.dodgeScale,
    "--slider-handle-dodge-margin": `${p.handle.dodgeMargin}px`,
    "--slider-handle-width": `${p.handle.width}px`,
    "--slider-handle-height": `${p.handle.height}px`,
    "--slider-handle-gap": `${p.handle.gap}px`,
    "--slider-handle-edge-gap": `${p.handle.edgeGap}px`,
    "--slider-handle-duration": `${toCssTiming(p.handle.transition).duration}s`,
    "--slider-handle-ease": toCssTiming(p.handle.transition).ease,
  } as CSSProperties;

  return (
    <ComponentWrapper>
      <div className="flex">
        <DialRoot theme="dark" />
        <Slider.Root
          defaultValue={64}
          format={(v) => `${v}%`}
          style={vars}
          marks={p.marks.groups}
          snapRange={p.marks.snap}
          stretch={p.stretch}
          transition={toMotionTransition(p.spring)}
        >
          <Slider.Fill />
          <Slider.Marks />
          <Slider.Handle alwaysVisible={p.handle.alwaysShow} />
          <Slider.Label>Opacity</Slider.Label>
          <Slider.Value />
        </Slider.Root>
      </div>
    </ComponentWrapper>
  );
}
