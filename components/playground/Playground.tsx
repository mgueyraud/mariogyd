"use client";
// Must stay the first import: patches rAF / performance.now / timers before
// motion caches them, otherwise slow-mo won't reach motion animations.
import "@aiforui/lapse/install";

import { useState, type CSSProperties } from "react";
import { Lapse } from "@aiforui/lapse";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import ThemeSwitch, { type Theme } from "./ThemeSwitch";
import ZoomControl from "./ZoomControl";
import CrtTuner from "./CrtTuner";

/*
 * Blank canvas for trying out demos. Lapse (bottom-left) slows time and
 * records takes; DialKit gives live controls (call useDialKit in whatever
 * you drop on the canvas). Canvas colors match DialKit's own glass bg.
 */
const CANVAS: Record<Theme, string> = { dark: "#212121", light: "#fafafa" };

// Toolbar chrome, outside DialKit so it never ends up in copied presets.
const CHROME = {
  dark: {
    "--chrome-bg": "#212121",
    "--chrome-fg": "rgba(255, 255, 255, 0.7)",
    "--chrome-border": "rgba(255, 255, 255, 0.1)",
    "--chrome-hover": "rgba(255, 255, 255, 0.1)",
    "--chrome-active": "rgba(255, 255, 255, 0.15)",
    "--chrome-shadow": "0 4px 16px rgba(0, 0, 0, 0.25)",
  },
  light: {
    "--chrome-bg": "#fafafa",
    "--chrome-fg": "rgba(0, 0, 0, 0.6)",
    "--chrome-border": "rgba(0, 0, 0, 0.1)",
    "--chrome-hover": "rgba(0, 0, 0, 0.08)",
    "--chrome-active": "rgba(0, 0, 0, 0.1)",
    "--chrome-shadow": "0 2px 10px rgba(0, 0, 0, 0.06)",
  },
} as Record<Theme, CSSProperties>;

export default function Playground() {
  // `?theme=light` picks the initial theme (handy for headless captures).
  const [theme, setTheme] = useState<Theme>(() =>
    new URLSearchParams(window.location.search).get("theme") === "light" ? "light" : "dark",
  );
  const [zoom, setZoom] = useState(1);

  return (
    <main
      className="grid min-h-dvh place-items-center"
      style={{ background: CANVAS[theme] }}
    >
      {/* Scales only the canvas, so the panels stay put. CSS `zoom` re-lays
          out instead of scaling a bitmap, so hairlines stay crisp at 4x. */}
      <div style={{ zoom }}>
        <CrtTuner />
      </div>
      <div
        style={CHROME[theme]}
        className="fixed top-4 left-4 flex items-center gap-0.5 rounded-lg border border-(--chrome-border) bg-(--chrome-bg) p-0.5 text-(--chrome-fg) shadow-(--chrome-shadow) select-none"
      >
        <ZoomControl zoom={zoom} onChange={setZoom} />
        <div aria-hidden className="mx-0.5 h-4 w-px bg-(--chrome-border)" />
        <ThemeSwitch theme={theme} onChange={setTheme} />
      </div>
      <DialRoot theme={theme} />
      <Lapse />
    </main>
  );
}
