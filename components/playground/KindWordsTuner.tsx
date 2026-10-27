"use client";

import { useDialKit, type DialConfig, type TransitionConfig } from "dialkit";
import type { ValueAnimationTransition } from "framer-motion";
import KindWords, { DEFAULT_MOTION } from "@/components/home/KindWords";
import { KIND_WORDS } from "@/lib/kind-words";

/*
 * The Kind Words carousel with its motion on DialKit controls. Pick an easing
 * preset to compare curves quickly, or set it to custom and draw one in the
 * editor; Lapse (bottom-left) slows the whole thing down. When something
 * feels right, copy the numbers into DEFAULT_MOTION in KindWords.
 */
const PRESETS: Record<string, [number, number, number, number]> = {
  "out-quart": [0.165, 0.84, 0.44, 1],
  "out-quint": [0.23, 1, 0.32, 1],
  "out-expo": [0.19, 1, 0.22, 1],
  "out-circ": [0.075, 0.82, 0.165, 1],
  "in-out-cubic": [0.645, 0.045, 0.355, 1],
  "in-out-quart": [0.77, 0, 0.175, 1],
  "in-out-quint": [0.86, 0, 0.07, 1],
};

const slide = DEFAULT_MOTION.slide as { duration: number };
const release = DEFAULT_MOTION.release as { duration: number; bounce: number };

const CONFIG = {
  // Arrow and dot clicks.
  preset: { type: "select", options: ["custom", ...Object.keys(PRESETS)], default: "out-expo" },
  slide: { type: "easing", duration: slide.duration, ease: PRESETS["out-expo"] },
  // Letting go of a drag.
  release: { type: "spring", visualDuration: release.duration, bounce: release.bounce },
  // Blur on a slide a full viewport away; the fade's slope with distance.
  blur: [DEFAULT_MOTION.blur, 0, 20, 0.5],
  fade: [DEFAULT_MOTION.fade, 1, 3, 0.05],
} satisfies DialConfig;

// DialKit's editor can flip either control between a curve and a spring, and
// its spring speaks visualDuration, which this framer-motion only knows as
// duration.
function toMotion(
  t: TransitionConfig,
  ease?: [number, number, number, number]
): ValueAnimationTransition<number> {
  if (t.type === "easing") {
    return { type: "tween", duration: t.duration, ease: ease ?? t.ease };
  }
  const { stiffness, damping, mass, visualDuration, bounce } = t;
  return stiffness != null
    ? { type: "spring", stiffness, damping, mass }
    : { type: "spring", duration: visualDuration ?? 0.5, bounce: bounce ?? 0 };
}

export default function KindWordsTuner() {
  const p = useDialKit("Kind words", CONFIG);
  const ease = p.preset === "custom" ? undefined : PRESETS[p.preset];

  return (
    <div className="w-[min(600px,calc(100vw-48px))] rounded-xl bg-paper px-6 pt-2 pb-10 font-sans text-sm leading-[1.6] text-ink antialiased">
      <KindWords
        items={KIND_WORDS}
        settings={{
          slide: toMotion(p.slide, ease),
          release: toMotion(p.release),
          blur: p.blur,
          fade: p.fade,
        }}
      />
    </div>
  );
}
