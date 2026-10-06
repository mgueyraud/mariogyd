"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import ComponentWrapper from "../ComponentWrapper";
import HL from "./hairline/kernel";
import { typewriter } from "./hairline/typewriter";

/** Characters per row: the widest the sheet holds. */
const ROW_LENGTH = 12;

/*
 * Plates are filled to hide what is behind them, so they take the wrapper's
 * dark background. The kernel's dark strokes are tuned for a near-black page;
 * on ink they are lifted one step to stay readable. Inline, because the
 * kernel's sheet is unlayered and would beat any Tailwind utility.
 */
const PALETTE = {
  "--hl-plate": "var(--color-ink)",
  "--hl-edge": "#7a7c84",
  "--hl-mid": "#55555c",
  "--hl-lo": "#3c3c41",
} as CSSProperties;

/*
 * The figure draws itself into an svg it is handed, the way the Hairline bench
 * mounts it: the kernel's stylesheet goes on the document once, the stage gets
 * `data-hairline` so it picks up that sheet, and `data-hairline-theme` pins it
 * to the dark palette the wrapper is drawn on. The figure also writes a caption to a
 * read-out; this demo doesn't show one, so it gets a stand-in that drops it.
 */
function Figure() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    HL.inject(document);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    const handle = typewriter.mount({ stage, svg, read: { textContent: "" } }, ROW_LENGTH);
    return () => {
      handle.destroy();
      svg.remove();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      data-hairline={typewriter.name}
      data-hairline-theme="dark"
      role="img"
      aria-label={typewriter.means}
      className="w-full"
      style={PALETTE}
    />
  );
}

export default function HairlineTypewriter() {
  return (
    <ComponentWrapper>
      <Figure />
    </ComponentWrapper>
  );
}
