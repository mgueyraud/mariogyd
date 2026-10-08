"use client";
import { useEffect, useRef } from "react";
import ComponentWrapper from "../ComponentWrapper";
import * as goldenGate from "./ascii/golden-gate";
import { mount } from "./ascii/mount";

/*
 * The scene draws itself onto a canvas as wide as its container, at the 2:1
 * shape of its 200 × 100 grid. `mount` only plays while the canvas is on
 * screen and holds the first frame for readers who prefer reduced motion.
 */
function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mount(canvas, goldenGate);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Sunset through the Golden Gate Bridge, fog rolling in under the deck, drawn in coloured ascii dots"
      className="w-full rounded-sm"
    />
  );
}

export default function GoldenGateAscii() {
  return (
    <ComponentWrapper hasLightMode>
      <Scene />
    </ComponentWrapper>
  );
}
