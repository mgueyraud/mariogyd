"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import MachineView from "@/components/site/MachineView";
import { tapTarget } from "@/components/site/TextLink";
import { useIsMobile, useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * HUMAN / MACHINE. The page is an old TV. Picking MACHINE switches it off: an
 * aperture over the page closes to a glowing line, the line shrinks to a dot,
 * the dot dies, and after a beat the mirror comes up as a dark page of its
 * own with no nav: on the wrong channel at first, all noise, resolving from
 * the top left (MachineView). HUMAN there (or Escape) runs it backwards.
 *
 * The page never deforms. The aperture is a clip-path inset on the page
 * wrapper (a mask in page coordinates, so it tracks the scroll position). The
 * light is two fixed layers at the viewport centre: a sharp full-width line
 * with a glow, and a soft orb. Switching off:
 *
 *   1. collapse — the aperture closes to the line
 *   2. charge   — the orb swells up with an overshoot, like a charge before it blows
 *   3. swallow  — the line draws in, going a little soft, into the orb
 *   4. die      — once the line is inside, the orb shrinks to nothing, line and all
 *
 * Switching on runs it back, except the line grows out of the orb while the
 * orb is still charging (`grow`), quicker than it went in: a TV comes on
 * faster than it dies. Everything goes through the Web Animations API
 * from CrtSettings, so the playground can put it on DialKit
 * (components/playground/CrtTuner.tsx).
 *
 *   human → off → machine → on → human
 *
 * Reduced motion, and phones, skip straight between `human` and `machine`
 * with no TV and no scramble: the page just becomes the mirror.
 *
 * The two views share one scroll offset. The page and the mirror are laid
 * out on the same grid, so carrying the offset across keeps the checkbox,
 * and the top of the text, exactly where they were.
 */

type Mode = "human" | "machine";
type Phase = Mode | "off" | "on";

export type Ease = [number, number, number, number];
export type Step = { duration: number; ease: Ease };

export type CrtSettings = {
  /** Aperture closing to the line (and opening on the way back). */
  collapse: Step;
  /** The orb swelling up. */
  charge: Step;
  /** The line drawing into the orb. */
  swallow: Step;
  /** The line growing back out of the orb on the way on, alongside the charge. */
  grow: Step;
  /** The orb and line dying, seconds. Starts once the line is inside the orb. */
  fade: number;
  /** Black beat before the text comes up. Seconds. */
  dark: number;
  /** Mirror text fade, seconds. */
  textIn: number;
  textOut: number;
  /** The mirror text resolving out of noise: the sweep and the all-noise hold before it (seconds), how often the noise re-rolls (ms), and the slant of the front (0–1, see MachineView). */
  scramble: number;
  hold: number;
  reroll: number;
  slant: number;
  /** Line thickness, px. */
  line: number;
  /** Page brightness at the moment it becomes the line. */
  flash: number;
  /** How soft the line goes while it is being swallowed (and grown back), px. */
  blur: number;
  /** Line glow: blur radius, spread, opacity. */
  glow: number;
  spread: number;
  glowOpacity: number;
  /** The orb's diameter, px, and how far past it the charge overshoots. */
  orb: number;
  orbPeak: number;
  /** How much of the orb is solid white before its edge softens, 0–1. */
  orbCore: number;
};

export const DEFAULT_CRT: CrtSettings = {
  collapse: { duration: 0.25, ease: [0.7, 0, 0.84, 0] },
  charge: { duration: 0.28, ease: [0.34, 1.56, 0.64, 1] },
  swallow: { duration: 0.25, ease: [0.5, 0, 0.75, 0] },
  grow: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  fade: 0.22,
  dark: 0.25,
  textIn: 0,
  textOut: 0.14,
  scramble: 2.35,
  hold: 0.39,
  reroll: 60,
  slant: 0.55,
  line: 6,
  blur: 2,
  flash: 4.1,
  glow: 86,
  spread: 31,
  glowOpacity: 0.55,
  orb: 240,
  orbPeak: 1.4,
  orbCore: 0.7,
};

const ms = (s: number) => s * 1000;
const bezier = ([a, b, c, d]: Ease) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
const sleep = (s: number, signal: { cancelled: boolean }) =>
  new Promise<void>((resolve) => {
    const t = window.setTimeout(resolve, ms(s));
    const tick = () => {
      if (signal.cancelled) window.clearTimeout(t), resolve();
    };
    window.setTimeout(tick, 0);
  });

/** The beam's glow: a tight bright halo and a wide soft one. */
function glow(c: CrtSettings, k = 1) {
  const o = c.glowOpacity;
  return `0 0 ${c.glow * k}px ${c.spread * k}px rgba(255,255,255,${o}), 0 0 ${c.glow * 3 * k}px ${c.spread * 2 * k}px rgba(255,255,255,${o * 0.45})`;
}

/** The viewport, as insets on the (document-tall) page, open and closed to the line. */
function aperture(page: HTMLElement, line: number) {
  const rect = page.getBoundingClientRect();
  const vh = window.innerHeight;
  const top = Math.max(0, -rect.top);
  const bottom = Math.max(0, rect.height - top - vh);
  const centerY = vh / 2 - rect.top;
  const lineTop = Math.max(0, centerY - line / 2);
  const lineBottom = Math.max(0, rect.height - (centerY + line / 2));
  return {
    open: `inset(${top}px 0 ${bottom}px 0)`,
    closed: `inset(${lineTop}px 0 ${lineBottom}px 0)`,
  };
}

const ViewModeContext = createContext<{
  mode: Mode;
  busy: boolean;
  setMode: (mode: Mode) => void;
} | null>(null);

const NavToggleRefContext = createContext<RefObject<HTMLDivElement> | null>(null);

function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode needs a ViewModeProvider");
  return ctx;
}

export function ViewModeProvider({
  markdown,
  settings,
  children,
}: {
  markdown: string;
  settings?: Partial<CrtSettings>;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("human");
  // Set by the off sequence once the aperture has closed, cleared by the on
  // sequence once it has reopened. Separate from `phase` so the page can go
  // dark mid-sequence without a phase of its own.
  const [pictureHidden, setPictureHidden] = useState(false);
  // No TV, no scramble: the views just swap.
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const instant = reduced || mobile;
  const pathname = usePathname();
  const screenRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLElement>(null);
  // The mirror's text. On the way in only the text fades, so the checkbox,
  // handed over from the overlay, doesn't blink. On the way out the whole
  // mirror fades, background included, to uncover the light and the page.
  const textRef = useRef<HTMLDivElement>(null);
  const navToggleRef = useRef<HTMLDivElement>(null);
  // The scroll offset the views share: read from whichever view is leaving
  // when the switch is thrown, and put on the one coming up.
  const [carried, setCarried] = useState(0);
  const carriedRef = useRef(0);
  carriedRef.current = carried;

  const s = { ...DEFAULT_CRT, ...settings };
  // Sequences read the latest numbers without restarting when they change.
  const settingsRef = useRef(s);
  settingsRef.current = s;

  // The checkbox flips the moment it is clicked, not when the TV gets there.
  const mode: Mode = phase === "machine" || phase === "off" ? "machine" : "human";
  const busy = phase === "off" || phase === "on";

  const setMode = useCallback(
    (next: Mode) => {
      if (busy || next === mode) return;
      setCarried(next === "machine" ? window.scrollY : (mirrorRef.current?.scrollTop ?? 0));
      if (instant) {
        setPhase(next);
        return;
      }
      setPhase(next === "machine" ? "off" : "on");
    },
    [busy, mode, instant]
  );

  // Hand the carried offset over: onto the mirror as it mounts, back onto the
  // page as the mirror leaves. Layout effect so the mirror never paints at the
  // top, and so the page is in place before the on sequence measures the
  // aperture. The document still scrolls programmatically with its overflow
  // hidden, which is what the lock below relies on.
  const prevPhase = useRef<Phase>("human");
  useLayoutEffect(() => {
    const was = prevPhase.current;
    prevPhase.current = phase;
    if (phase === "machine" && mirrorRef.current) {
      mirrorRef.current.scrollTop = carriedRef.current;
    } else if (was === "machine" && (phase === "on" || phase === "human")) {
      window.scrollTo(0, carriedRef.current);
    }
  }, [phase]);

  // A nav click while the TV is off should land on the page, lit.
  useEffect(() => {
    setPhase("human");
    setPictureHidden(false);
    screenRef.current?.getAnimations().forEach((a) => a.cancel());
  }, [pathname]);

  // Off: collapse → charge → swallow → die → dark.
  useEffect(() => {
    if (phase !== "off") return;
    const page = screenRef.current;
    const beam = beamRef.current;
    const orb = orbRef.current;
    if (!page || !beam || !orb) return;
    const signal = { cancelled: false };
    const live: Animation[] = [];
    const run = (el: Element, k: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = el.animate(k, { fill: "forwards", ...o });
      live.push(a);
      return a.finished;
    };

    (async () => {
      const c = settingsRef.current;
      const { open, closed } = aperture(page, c.line);
      const inside = `${c.orb * 0.5}px`;
      try {
        // 1. The aperture closes to the line.
        await Promise.all([
          run(
            page,
            [
              { clipPath: open, filter: "brightness(1)" },
              { clipPath: closed, filter: `brightness(${c.flash})` },
            ],
            { duration: ms(c.collapse.duration), easing: bezier(c.collapse.ease) }
          ),
          run(beam, [{ opacity: 0 }, { opacity: 1 }], {
            duration: ms(c.collapse.duration),
            easing: "ease-in",
          }),
        ]);
        if (signal.cancelled) return;
        setPictureHidden(true);
        // 2. The orb charges up, overshooting before it settles.
        await run(
          orb,
          [
            { scale: "0.2", opacity: 0 },
            { scale: String(c.orbPeak), opacity: 1, offset: 0.6 },
            { scale: "1", opacity: 1 },
          ],
          { duration: ms(c.charge.duration), easing: bezier(c.charge.ease) }
        );
        // 3. The line draws into the orb, softening as it goes.
        await run(
          beam,
          [
            { width: "100vw", filter: "blur(0px)" },
            { width: inside, filter: `blur(${c.blur}px)` },
          ],
          { duration: ms(c.swallow.duration), easing: bezier(c.swallow.ease) }
        );
        // 4. The orb dies with the line inside it: both shrink on the same
        // curve, so the line never shows past the orb's edge.
        const die = { duration: ms(c.fade), easing: "ease-in" };
        await Promise.all([
          run(orb, [{ scale: "1", opacity: 1 }, { scale: "0", opacity: 0 }], die),
          run(beam, [{ width: inside, opacity: 1 }, { width: "0px", opacity: 0 }], die),
        ]);
        await sleep(c.dark, signal);
        if (signal.cancelled) return;
        setPhase("machine");
      } catch {
        // An animation was cancelled — the sequence was abandoned.
      }
    })();

    return () => {
      signal.cancelled = true;
      live.forEach((a) => a.cancel());
    };
  }, [phase]);

  // On: text fades → the orb charges while the line grows out of it → the aperture opens.
  useEffect(() => {
    if (phase !== "on") return;
    const page = screenRef.current;
    const beam = beamRef.current;
    const orb = orbRef.current;
    const mirror = mirrorRef.current;
    if (!page || !beam || !orb || !mirror) return;
    const signal = { cancelled: false };
    const live: Animation[] = [];
    const run = (el: Element, k: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = el.animate(k, { fill: "forwards", ...o });
      live.push(a);
      return a.finished;
    };

    (async () => {
      const c = settingsRef.current;
      const { open, closed } = aperture(page, c.line);
      const inside = `${c.orb * 0.5}px`;
      try {
        await run(mirror, [{ opacity: 1 }, { opacity: 0 }], {
          duration: ms(c.textOut),
          easing: "ease-in",
        });
        // The orb charges up and the line grows out of it at the same time.
        await Promise.all([
          run(
            orb,
            [
              { scale: "0.2", opacity: 0 },
              { scale: String(c.orbPeak), opacity: 1, offset: 0.6 },
              { scale: "1", opacity: 1 },
            ],
            { duration: ms(c.charge.duration), easing: bezier(c.charge.ease) }
          ),
          run(
            beam,
            [
              { width: inside, opacity: 0, filter: `blur(${c.blur}px)` },
              { width: inside, opacity: 1, offset: 0.25 },
              { width: "100vw", opacity: 1, filter: "blur(0px)" },
            ],
            { duration: ms(c.grow.duration), easing: bezier(c.grow.ease) }
          ),
        ]);
        if (signal.cancelled) return;
        // The page's old closed-aperture animation is still holding it; this
        // one starts from the same place, so swapping is seamless.
        page.getAnimations().forEach((a) => a.cancel());
        const opening = run(
          page,
          [
            { clipPath: closed, filter: `brightness(${c.flash})` },
            { clipPath: open, filter: "brightness(1)" },
          ],
          { duration: ms(c.collapse.duration), easing: bezier(c.collapse.ease) }
        );
        flushSync(() => setPictureHidden(false));
        const out = { duration: ms(c.collapse.duration), easing: "ease-out" };
        await Promise.all([
          opening,
          run(beam, [{ opacity: 1 }, { opacity: 0 }], out),
          run(orb, [{ scale: "1", opacity: 1 }, { scale: "0.6", opacity: 0 }], out),
        ]);
        if (signal.cancelled) return;
        // Drop the forwards fill so nothing is clipped or filtered at rest.
        page.getAnimations().forEach((a) => a.cancel());
        setPhase("human");
      } catch {
        // Cancelled mid-sequence.
      }
    })();

    return () => {
      signal.cancelled = true;
      live.forEach((a) => a.cancel());
    };
  }, [phase]);

  // The text comes up. Only the text: the checkbox is already there, handed
  // over from the overlay, so it must not blink. Layout effect so the first
  // painted frame is already at opacity 0.
  useLayoutEffect(() => {
    if (phase !== "machine" || instant) return;
    const text = textRef.current;
    if (!text) return;
    const a = text.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: ms(settingsRef.current.textIn),
      easing: "ease-out",
    });
    return () => a.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // The page scrolls behind the mirror otherwise. Locked for the whole
  // transition so the aperture can't drift while it's closing.
  useEffect(() => {
    if (phase === "human") return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [phase]);

  // Focus follows the picture: into the mirror when it comes up, back to the
  // nav toggle when the page returns. Not on first load, where the page was
  // never off and a focus ring would just appear.
  const wasOff = useRef(false);
  useEffect(() => {
    if (phase === "machine") {
      mirrorRef.current?.focus({ preventScroll: true });
    } else if (phase === "human" && wasOff.current) {
      navToggleRef.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
    }
    wasOff.current = phase !== "human";
  }, [phase]);

  useEffect(() => {
    if (phase !== "machine") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("human");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, setMode]);

  const hidden = pictureHidden || phase === "machine";
  const beamShown = phase === "off" || phase === "on";
  const mirrorShown = phase === "machine" || phase === "on";

  return (
    <ViewModeContext.Provider value={{ mode, busy, setMode }}>
      <NavToggleRefContext.Provider value={navToggleRef}>
        {/* The picture. Above the black while the aperture closes; gone once it has. */}
        <div
          ref={screenRef}
          className={cn("relative z-20 bg-paper", hidden && "invisible")}
          aria-hidden={hidden || undefined}
          {...(hidden ? ({ inert: "" } as object) : {})}
        >
          {children}
        </div>

        {phase !== "human" && (
          <div aria-hidden className="fixed inset-0 z-10 bg-ink" />
        )}

        {beamShown && (
          <div aria-hidden className="pointer-events-none fixed inset-0 z-[25]">
            {/* Orb: a solid white disc with a short soft edge and a wide faint halo. `translate` centres it so `scale` stays centred too. */}
            <div
              ref={orbRef}
              className="absolute top-1/2 left-1/2 rounded-full opacity-0 will-change-[opacity,scale]"
              style={{
                translate: "-50% -50%",
                width: s.orb,
                height: s.orb,
                // The gradient reaches half-bright at the edge, where the shadow blur picks it up at the same level.
                background: `radial-gradient(circle, #fff 0 ${s.orbCore * 50}%, rgba(255,255,255,0.5) 50%)`,
                boxShadow: `0 0 ${s.orb * 0.3}px 0 #fff, 0 0 ${s.orb * 0.9}px ${s.orb * 0.15}px rgba(255,255,255,0.18)`,
              }}
            />
            {/* Line: sharp, full width, with its own glow. */}
            <div
              ref={beamRef}
              className="absolute top-1/2 left-1/2 rounded-full bg-white opacity-0 will-change-[opacity,width]"
              style={{
                translate: "-50% -50%",
                width: "100vw",
                height: s.line,
                boxShadow: glow(s),
              }}
            />
          </div>
        )}

        {/* While the TV switches, the checkbox rides above everything in
            its nav position, already flipped, instead of going with the
            picture and coming back with the text. Shifted up by the carried
            scroll so it sits exactly over the in-flow pair on both sides
            (off screen if the nav is). `difference` keeps it legible over
            paper, the flash and ink alike. */}
        {beamShown && (
          <div
            className="pointer-events-none fixed inset-x-0 z-40 mix-blend-difference"
            style={{
              top: -carried,
              padding: "clamp(48px, 9vw, 88px) clamp(18px, 5vw, 24px) 0",
            }}
          >
            <div
              className="flex min-h-[1lh] max-w-[600px] items-center justify-end text-[13px]"
              style={{ marginLeft: "clamp(0px, 30vw - 210px, 260px)" }}
            >
              <ViewModeToggle tone="blend" />
            </div>
          </div>
        )}

        {mirrorShown && (
          <section
            ref={mirrorRef}
            tabIndex={-1}
            aria-label="Plain-text mirror of this site"
            className="fixed inset-0 z-30 overflow-y-auto bg-ink text-paper outline-none selection:bg-[#44443f] selection:text-paper"
            style={{ padding: "clamp(48px, 9vw, 88px) clamp(18px, 5vw, 24px) 96px" }}
          >
            <div
              className="max-w-[600px]"
              style={{ marginLeft: "clamp(0px, 30vw - 210px, 260px)" }}
            >
              {/* Same row metrics as the nav so the checkbox stays put between views. */}
              <div className="mb-[clamp(56px,10vw,84px)] flex min-h-[1lh] items-center justify-end text-[13px]">
                <ViewModeToggle tone="dark" />
              </div>
              <div ref={textRef}>
                <MachineView
                  markdown={markdown}
                  scramble={
                    instant
                      ? undefined
                      : { duration: s.scramble, hold: s.hold, reroll: s.reroll, slant: s.slant }
                  }
                />
              </div>
            </div>
          </section>
        )}
      </NavToggleRefContext.Provider>
    </ViewModeContext.Provider>
  );
}

const OPTIONS: { value: Mode; label: string }[] = [
  { value: "human", label: "HUMAN" },
  { value: "machine", label: "MACHINE" },
];

const TONES = {
  light: { on: "text-ink", off: "text-faint hoverable:text-ink" },
  dark: { on: "text-paper", off: "text-[#75756e] hoverable:text-paper" },
  // White under mix-blend-mode: difference, so it reads on anything.
  blend: { on: "text-white", off: "text-white/50 hoverable:text-white" },
};

/**
 * The `[x] HUMAN  [ ] MACHINE` pair. In the nav on paper, on the mirror in
 * ink, and blended over both while the TV switches; the in-flow pair hides
 * then so there is only ever one on screen.
 */
export function ViewModeToggle({ tone = "light" }: { tone?: keyof typeof TONES }) {
  const { mode, busy, setMode } = useViewMode();
  const navRef = useContext(NavToggleRefContext);
  const colors = TONES[tone];
  return (
    <div
      ref={tone === "light" ? navRef : undefined}
      role="group"
      aria-label="Read as"
      aria-busy={busy || undefined}
      className={cn(
        "flex gap-3.5 font-mono text-[11px] tracking-[0.06em]",
        busy && tone !== "blend" && "invisible"
      )}
    >
      {OPTIONS.map(({ value, label }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            className={cn(
              tapTarget,
              "whitespace-nowrap transition-colors",
              active ? colors.on : colors.off
            )}
          >
            <span aria-hidden>{active ? "[x]" : "[ ]"}</span> {label}
          </button>
        );
      })}
    </div>
  );
}
