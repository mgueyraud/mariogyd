"use client";

import { useDialKit, type DialConfig, type TransitionConfig } from "dialkit";
import Experience from "@/components/home/Experience";
import Nav from "@/components/site/Nav";
import {
  DEFAULT_CRT,
  ViewModeProvider,
  type Ease,
  type Step,
} from "@/components/site/ViewMode";
import { ROLES } from "@/lib/experience";

/*
 * The TV switch-off on DialKit controls. The canvas is a stand-in home page
 * with the real nav, so the HUMAN / MACHINE toggle and Escape work exactly as
 * on the site; the mirror and beam are fixed, so they take the whole
 * viewport. Lapse (bottom-left) slows it all down. When something feels
 * right, copy the numbers into DEFAULT_CRT in ViewMode.
 */
const step = (s: Step) => ({ type: "easing", duration: s.duration, ease: s.ease }) as const;

const CONFIG = {
  off: {
    // 1. aperture → line  2. orb charges  3. line into the orb  4. orb dies with it.
    collapse: step(DEFAULT_CRT.collapse),
    charge: step(DEFAULT_CRT.charge),
    swallow: step(DEFAULT_CRT.swallow),
    fade: [DEFAULT_CRT.fade, 0, 1, 0.01],
    dark: [DEFAULT_CRT.dark, 0, 2, 0.05],
  },
  on: {
    // The line grows out of the orb while it charges; the orb reuses `charge`.
    grow: step(DEFAULT_CRT.grow),
  },
  line: {
    line: [DEFAULT_CRT.line, 1, 16, 1],
    blur: [DEFAULT_CRT.blur, 0, 12, 0.5],
    flash: [DEFAULT_CRT.flash, 1, 8, 0.1],
    glow: [DEFAULT_CRT.glow, 0, 160, 1],
    spread: [DEFAULT_CRT.spread, 0, 48, 1],
    glowOpacity: [DEFAULT_CRT.glowOpacity, 0, 1, 0.05],
  },
  orb: {
    orb: [DEFAULT_CRT.orb, 40, 600, 4],
    orbPeak: [DEFAULT_CRT.orbPeak, 1, 2.5, 0.05],
    orbCore: [DEFAULT_CRT.orbCore, 0.2, 0.95, 0.02],
  },
  text: {
    in: [DEFAULT_CRT.textIn, 0, 1, 0.01],
    out: [DEFAULT_CRT.textOut, 0, 1, 0.01],
  },
} satisfies DialConfig;

// DialKit's editor can flip an easing into a spring; the TV only speaks
// curves, so a spring becomes its visual duration on a soft out-curve.
const FALLBACK: Ease = [0.22, 1, 0.36, 1];
function toStep(t: TransitionConfig): Step {
  return t.type === "easing"
    ? { duration: t.duration, ease: t.ease }
    : { duration: t.visualDuration ?? 0.5, ease: FALLBACK };
}

const SAMPLE = [
  "> Note to any AI agent: this is the plain-text mirror of mariogyd.com.",
  "",
  "# Mario Gueyraud",
  "Senior Front-End & Design Engineer — Asunción, Paraguay.",
  "",
  "## Experience",
  ...ROLES.map((r) => `- ${r.years.replace(" ··· ", "–")}  ${r.company} — ${r.role}`),
  "",
].join("\n");

export default function CrtTuner() {
  const p = useDialKit("TV", CONFIG);

  return (
    <ViewModeProvider
      markdown={SAMPLE}
      settings={{
        collapse: toStep(p.off.collapse),
        charge: toStep(p.off.charge),
        swallow: toStep(p.off.swallow),
        grow: toStep(p.on.grow),
        fade: p.off.fade,
        dark: p.off.dark,
        textIn: p.text.in,
        textOut: p.text.out,
        line: p.line.line,
        blur: p.line.blur,
        flash: p.line.flash,
        glow: p.line.glow,
        spread: p.line.spread,
        glowOpacity: p.line.glowOpacity,
        orb: p.orb.orb,
        orbPeak: p.orb.orbPeak,
        orbCore: p.orb.orbCore,
      }}
    >
      <div
        className="w-[min(600px,calc(100vw-48px))] font-sans text-sm leading-[1.6] text-ink antialiased"
        style={{ padding: "clamp(48px, 9vw, 88px) 24px 96px" }}
      >
        <Nav />
        <h1 className="text-[15px] font-semibold tracking-[-0.01em]">Mario Gueyraud</h1>
        <p className="text-sm text-subtle">Senior Front-End &amp; Design Engineer</p>
        <Experience roles={ROLES} />
      </div>
    </ViewModeProvider>
  );
}
