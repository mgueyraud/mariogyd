"use client";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type ValueAnimationTransition,
} from "motion/react";
import { cn } from "@/lib/utils";
import { SliderContext, clamp } from "./context";

/*
 * Remaining HTML attributes (aria-*, data-*, id, event handlers) land on the
 * focusable role="slider" element, as does the ref. `className` and `style`
 * go on the outer box, which owns layout and the --slider-* theme variables.
 */
export type SliderRootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "className" | "style"
> & {
  /** Controlled value. Leave out and use `defaultValue` for uncontrolled. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Text for Slider.Value and for screen readers (aria-valuetext). */
  format?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
  /**
   * Number of equal groups the track is divided into. Slider.Marks draws the
   * lines between them and clicks snap to them; 0 turns both off.
   */
  marks?: number;
  /**
   * A click (not a drag) within this many value units of a mark, or of
   * either end, lands exactly on it. 0 turns snapping off.
   */
  snapRange?: number;
  /**
   * Rubber band past either end while dragging: the pointer travels
   * `deadZone` px beyond the edge before anything happens, then the track
   * stretches toward it, approaching `limit` px but never reaching it.
   */
  stretch?: { deadZone: number; limit: number };
  /** How the fill and handle travel to a new value (not while dragging). */
  transition?: ValueAnimationTransition<number>;
};

// Pointer travel before a press counts as a drag, so a slightly shaky click
// keeps its snap.
const DRAG_THRESHOLD = 3;

// iOS-style rubber band: 1:1-ish at first, easing off toward `limit` as the
// pointer keeps going, so the pointer range is unbounded but the stretch isn't.
const rubberBand = (distance: number, limit: number) =>
  limit * (1 - 1 / ((distance * 0.55) / limit + 1));

// Consumer handler first; ours is skipped if theirs calls preventDefault().
const compose =
  <E extends { defaultPrevented: boolean }>(
    theirs: ((e: E) => void) | undefined,
    ours: (e: E) => void,
  ) =>
  (e: E) => {
    theirs?.(e);
    if (!e.defaultPrevented) ours(e);
  };

/*
 * Owns the value and every interaction; the parts inside only draw.
 *
 * The whole row is the track. Pressing anywhere springs the fill and handle
 * there (motion, so a second press mid-flight keeps its velocity) and snaps
 * to a nearby mark; dragging follows the pointer 1:1 and never snaps.
 *
 * Dragging past either end rubber-bands the track toward the pointer. The
 * outer box never changes size, so it doubles as the fixed reference for
 * pointer math while the inner track stretches.
 */
export const SliderRoot = forwardRef<HTMLDivElement, SliderRootProps>(function SliderRoot(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    format = (v) => String(v),
    className,
    style,
    marks = 10,
    snapRange = 3,
    stretch = { deadZone: 25, limit: 5 },
    transition = { type: "spring", visualDuration: 0.3, bounce: 0.2 },
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
    onKeyDown: onKeyDownProp,
    children,
    ...rest
  },
  ref,
) {
  const restRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const labelId = useId();
  useImperativeHandle(ref, () => trackRef.current!);

  /* ─── Value: controlled when `value` is passed, otherwise internal ─── */

  const [innerValue, setInnerValue] = useState(defaultValue ?? min);
  const value = valueProp ?? innerValue;
  const setValue = (next: number) => {
    if (next === value) return;
    if (valueProp === undefined) setInnerValue(next);
    onValueChange?.(next);
  };

  const decimals = (String(step).split(".")[1] ?? "").length;
  const snapToStep = (n: number) =>
    Number(clamp(Math.round((n - min) / step) * step + min, min, max).toFixed(decimals));

  // Nearest mark (ends included) if within snapRange, else the raw value.
  const snapToMark = (v: number) => {
    if (marks < 1 || snapRange <= 0) return v;
    const groupSize = (max - min) / marks;
    const mark = min + Math.round((v - min) / groupSize) * groupSize;
    return Math.abs(v - mark) <= snapRange ? snapToStep(mark) : v;
  };

  /* ─── Pointer: press, drag, rubber band ─── */

  const [pressed, setPressed] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Signed px: negative stretches left, positive right.
  const [band, setBand] = useState(0);
  const pressX = useRef(0);

  const valueAt = (clientX: number) => {
    const rect = restRef.current!.getBoundingClientRect();
    return snapToStep(min + ((clientX - rect.left) / rect.width) * (max - min));
  };

  const bandAt = (clientX: number) => {
    const rect = restRef.current!.getBoundingClientRect();
    const past =
      clientX < rect.left ? clientX - rect.left : clientX > rect.right ? clientX - rect.right : 0;
    const beyond = Math.max(0, Math.abs(past) - stretch.deadZone);
    return Math.sign(past) * rubberBand(beyond, stretch.limit);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pressX.current = e.clientX;
    setPressed(true);
    // Snaps on press only; the first drag move replaces it with the exact value.
    setValue(snapToMark(valueAt(e.clientX)));
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.abs(e.clientX - pressX.current) <= DRAG_THRESHOLD) return;
    setDragging(true);
    setValue(valueAt(e.clientX));
    setBand(bandAt(e.clientX));
  };

  const endDrag = () => {
    setPressed(false);
    setDragging(false);
    setBand(0);
  };

  /* ─── Keyboard ─── */

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = (max - min) / 10;
    const next = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setValue(snapToStep(next));
  };

  /* ─── Motion: animated position the parts draw from ─── */

  const percent = ((value - min) / (max - min)) * 100;
  const shown = useMotionValue(percent);
  // In a ref so DialKit re-renders don't restart a spring that's mid-flight.
  const transitionRef = useRef(transition);
  transitionRef.current = transition;
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (dragging || reduceMotion) {
      shown.jump(percent);
      return;
    }
    const controls = animate(shown, percent, transitionRef.current);
    return () => controls.stop();
  }, [percent, dragging, reduceMotion, shown]);

  const valueText = format(value);

  return (
    <SliderContext.Provider
      value={{
        value,
        min,
        max,
        percent,
        shown,
        valueText,
        marks,
        pressed,
        trackRef,
        labelRef,
        valueRef,
        labelId,
      }}
    >
      <div ref={restRef} style={style} className={cn("w-(--slider-width)", className)}>
        <div
          aria-labelledby={labelId}
          {...rest}
          ref={trackRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          onPointerDown={disabled ? onPointerDownProp : compose(onPointerDownProp, onPointerDown)}
          onPointerMove={disabled ? onPointerMoveProp : compose(onPointerMoveProp, onPointerMove)}
          onPointerUp={compose(onPointerUpProp, endDrag)}
          onPointerCancel={compose(onPointerCancelProp, endDrag)}
          onKeyDown={disabled ? onKeyDownProp : compose(onKeyDownProp, onKeyDown)}
          data-pressed={pressed || undefined}
          style={{
            // Grows by |band| toward the pointer; the negative left margin keeps
            // the opposite end pinned. Eases back on release, 1:1 while dragging.
            width: `calc(100% + ${Math.abs(band)}px)`,
            marginLeft: Math.min(band, 0),
            ["--band-transition" as string]: dragging
              ? "none"
              : "width var(--slider-release-duration) var(--slider-release-ease), margin-left var(--slider-release-duration) var(--slider-release-ease)",
          }}
          className="group relative isolate flex h-(--slider-height) [transition:var(--band-transition)] motion-reduce:transition-none cursor-ew-resize touch-none select-none items-center justify-between overflow-hidden rounded-(--slider-radius) bg-(--slider-track) px-(--slider-padding) text-(--slider-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--slider-text) aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          {children}
        </div>
      </div>
    </SliderContext.Provider>
  );
});
