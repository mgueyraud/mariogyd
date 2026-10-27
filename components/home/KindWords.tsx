"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
  type ValueAnimationTransition,
} from "framer-motion";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { tapTarget } from "@/components/site/TextLink";
import type { Testimonial } from "@/lib/kind-words";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/** Fraction of the viewport a drag has to cover to commit to the next slide. */
const COMMIT_DISTANCE = 0.25;
/** px/s. A quick flick commits even when the distance doesn't. */
const COMMIT_VELOCITY = 500;

const INSTANT: ValueAnimationTransition<number> = { duration: 0 };

/**
 * Where the blur starts and tops out, as a fraction of a viewport away from
 * parked. Starting a little out keeps the last stretch of travel filter-free.
 */
const BLUR_START = 0.06;
const BLUR_FULL = 0.6;

export type MotionSettings = {
  /** Clicking an arrow or a dot: a quick response to a quick ask. */
  slide: ValueAnimationTransition<number>;
  /** Letting go of a drag: a spring keeps whatever velocity the finger had. */
  release: ValueAnimationTransition<number>;
  /** Blur, in px, on a slide a full viewport away. 0 turns it off. */
  blur: number;
  /**
   * How fast a slide fades with distance. 1 is a plain crossfade (both
   * neighbours at 50% halfway); higher drops the outgoing one sooner.
   */
  fade: number;
};

/**
 * The production values. The dev playground exposes these as DialKit
 * controls (components/playground/KindWordsTuner) — tune there, copy here.
 */
export const DEFAULT_MOTION: MotionSettings = {
  slide: { type: "tween", duration: 1, ease: [0.19, 1, 0.22, 1] },
  release: { type: "spring", duration: 0.6, bounce: 0.2 },
  blur: 3.5,
  fade: 1,
};

/**
 * Stand-in for a missing headshot: a soft mesh of muted stone, sage and
 * peach, warm enough to read as a portrait and quiet enough to sit beside
 * the real photos.
 */
const GRADIENT_AVATAR = [
  "radial-gradient(85% 85% at 22% 18%, #e8bf9c 0%, transparent 62%)",
  "radial-gradient(75% 75% at 82% 28%, #9fb3a0 0%, transparent 62%)",
  "radial-gradient(90% 90% at 72% 88%, #7e8699 0%, transparent 64%)",
  "radial-gradient(70% 70% at 18% 82%, #c9a3b4 0%, transparent 62%)",
  "linear-gradient(160deg, #d6ccbf, #6f6b66)",
].join(",");

const LINKEDIN = (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/**
 * Width of the fade at either side of the viewport. It lives in the page
 * gutter (and, on wide screens, the column's left offset — see
 * app/(site)/layout.tsx), so the parked slide stays flush with everything
 * else and the fade only touches a slide that's on its way in or out.
 */
const EDGE = "min(clamp(18px, 5vw, 24px) + max(0px, 30vw - 210px), 48px)";

/**
 * A mask rather than a painted gradient, so the fade goes to whatever is
 * behind it — a white overlay would show as a seam against paper. The stops
 * follow a smoothstep so the alpha has no kink at either end; a plain
 * two-stop gradient reads as a visible line where it finishes.
 */
const EDGE_MASK = (() => {
  const steps = 10;
  const stops: string[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const a = t * t * (3 - 2 * t);
    stops.push(`rgb(0 0 0 / ${a.toFixed(3)}) calc(var(--edge) * ${t})`);
  }
  const mirrored = [...stops]
    .reverse()
    .map((stop) => stop.replace("calc(var(--edge) * ", "calc(100% - var(--edge) * "));
  return `linear-gradient(to right, ${stops.join(", ")}, ${mirrored.join(", ")})`;
})();

const NAV_BUTTON = cn(
  "flex size-7 items-center justify-center rounded-full border border-line bg-paper text-[13px] text-subtle transition-[color,border-color,scale] duration-150 ease-out hoverable:border-line-strong hoverable:text-ink active:scale-96 motion-reduce:transition-none",
  tapTarget
);

export default function KindWords({
  items,
  settings = DEFAULT_MOTION,
}: {
  items: Testimonial[];
  settings?: MotionSettings;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [width, setWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // The track's offset in px. One value drives the slide, the drag, and each
  // slide's opacity, so they can never disagree mid-gesture.
  const x = useMotionValue(0);

  const count = items.length;
  const last = count - 1;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the current slide in place when the column reflows — this is a jump,
  // not a slide, so nothing is animated.
  useEffect(() => {
    x.set(-index * width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const settle = (next: number, transition: ValueAnimationTransition<number>) => {
    const i = Math.min(last, Math.max(0, next));
    if (i !== index) {
      setIndex(i);
      // An expanded slide stretches the whole track; don't carry that height
      // under the slide the visitor is moving to.
      setOpen(new Set());
    }
    animate(x, -i * width, reduced ? INSTANT : transition);
  };

  const go = (i: number) => settle(i, settings.slide);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const far = Math.abs(offset.x) > width * COMMIT_DISTANCE;
    const fast = Math.abs(velocity.x) > COMMIT_VELOCITY;
    const dir = (far || fast) && offset.x !== 0 ? (offset.x < 0 ? 1 : -1) : 0;
    settle(index + dir, settings.release);
  };

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <section className="mt-[clamp(64px,12vw,96px)]" aria-labelledby="kind-words">
      <div className="mb-7 flex items-center justify-between">
        <h2
          id="kind-words"
          className="font-mono text-[11px] font-normal tracking-[0.14em] text-faint"
        >
          KIND WORDS
        </h2>
        <div className="flex items-center gap-2.5">
          <span
            className="min-w-[34px] text-right font-mono text-[11px] tabular-nums text-faint"
            aria-live="polite"
          >
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous testimonial"
            className={NAV_BUTTON}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next testimonial"
            className={NAV_BUTTON}
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="-mx-(--edge) overflow-hidden px-(--edge)"
        style={{
          "--edge": EDGE,
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        } as CSSProperties}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -last * width, right: 0 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          style={{ x }}
          className="flex items-start will-change-transform"
        >
          {items.map((t, i) => (
            <Slide
              key={t.key}
              item={t}
              index={i}
              active={i === index}
              open={open.has(t.key)}
              onToggle={() => toggle(t.key)}
              x={x}
              width={width}
              blur={settings.blur}
              fade={settings.fade}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-[22px] flex gap-1.5" role="tablist" aria-label="Testimonials">
        {items.map((t, i) => {
          const active = i === index;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                "h-1 rounded-sm transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none",
                active ? "w-[18px] bg-ink" : "w-1.5 bg-line-strong",
                tapTarget
              )}
            />
          );
        })}
      </div>
    </section>
  );
}

function Slide({
  item: t,
  index: i,
  active,
  open,
  onToggle,
  x,
  width,
  blur,
  fade,
}: {
  item: Testimonial;
  index: number;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  x: MotionValue<number>;
  width: number;
  blur: number;
  fade: number;
}) {
  // How far this slide is from parked, in viewports. Drives both the fade
  // and the blur — whether it got there by a click, a drag, or the spring
  // after one.
  const away = useTransform(x, (v) =>
    width ? Math.abs(v + i * width) / width : active ? 0 : 1
  );
  // Gentle enough that a drag paused halfway still shows both neighbours
  // rather than a blank.
  const opacity = useTransform(away, (a) => Math.max(0, 1 - a * fade));
  // Sharp when parked, softening as it leaves. The blur reaches zero while
  // the slide is still a few percent out and the filter comes off there:
  // Safari renders anything behind a filter — even blur(0.1px) — on a
  // softer layer, and the ease-out and spring tails would otherwise keep
  // that layer alive until the very last frame, then snap to crisp.
  const filter = useTransform(away, (a) => {
    const t = (Math.min(1, a) - BLUR_START) / (BLUR_FULL - BLUR_START);
    if (!blur || t <= 0) return "none";
    const eased = Math.min(1, t) ** 2 * (3 - 2 * Math.min(1, t));
    return `blur(${(eased * blur).toFixed(2)}px)`;
  });

  return (
    <motion.figure
      aria-hidden={!active}
      // Off-screen slides stay in the DOM for the slide animation but must
      // not be reachable by keyboard or screen reader. React 18 only
      // forwards `inert` as a string; the types want React 19's boolean,
      // hence the cast.
      {...(active ? {} : ({ inert: "" } as object))}
      style={{ opacity, filter }}
      className="min-w-0 flex-[0_0_100%] pr-1"
    >
      <blockquote className="max-w-[30ch] font-serif text-[clamp(20px,3.4vw,24px)] italic leading-[1.35] tracking-[-0.01em] text-balance">
        “{t.highlight}”
      </blockquote>

      <figcaption className="mt-[18px] flex items-center gap-3">
        <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-hover ring-1 ring-line">
          <span className="absolute inset-0 flex items-center justify-center text-xs font-[550] text-faint">
            {t.initials}
          </span>
          {t.photo ? (
            <Image
              src={t.photo}
              alt=""
              fill
              sizes="36px"
              draggable={false}
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ background: GRADIENT_AVATAR }}
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col leading-[1.4]">
          <span className="text-[13px] font-[550]">
            {t.name}
            <a
              href={t.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.name} on LinkedIn`}
              draggable={false}
              className={cn(
                "ml-1.5 inline-flex items-center align-[-1px] text-faint transition-colors hoverable:text-ink",
                tapTarget,
                "before:-inset-x-2"
              )}
            >
              {LINKEDIN}
            </a>
            {t.now && <span className="font-normal text-faint"> · {t.now}</span>}
          </span>
          <span className="text-xs text-subtle">{t.together}</span>
        </span>
      </figcaption>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`kind-words-${t.key}`}
        className={cn(
          "ml-12 mt-3 border-b border-dotted border-line-strong font-mono text-[11px] text-faint transition-colors hoverable:border-ink hoverable:text-ink",
          tapTarget
        )}
      >
        {open ? "Less" : "Read full"}
      </button>
      <div
        id={`kind-words-${t.key}`}
        className="grid pl-12 transition-[grid-template-rows] duration-350 ease-in-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-2 pt-3">
            {t.paras.map((p) => (
              <p
                key={p}
                className="max-w-[52ch] text-[13px] leading-[1.65] text-subtle text-pretty"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.figure>
  );
}
