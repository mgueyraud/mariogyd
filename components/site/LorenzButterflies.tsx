"use client";

import { useEffect, useRef } from "react";

// A port of @yuruyurau's #つぶやきProcessing one-liner
// (x.com/yuruyurau/status/2053149494439800895): nine Lorenz attractors —
// the butterfly — folded onto a slowly turning ring. Same math, drawn straight
// into an ImageData buffer instead of p5, and in paper/ink instead of the
// original white-on-black.

const POINTS = 30_000;
const DT = 5e-4;
const SPACE = 400; // the sketch's native coordinate space
const MAX_BACKING = 900; // cap the buffer so the per-frame clear stays cheap
const INK = [28, 28, 26]; // #1C1C1A
const PAPER = [252, 252, 250]; // #FCFCFA
const ALPHA = 0.22;

export default function LorenzButterflies({
  className,
}: {
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const paperWord =
      ((255 << 24) | (PAPER[2] << 16) | (PAPER[1] << 8) | PAPER[0]) >>> 0;

    let dim = 0;
    let image: ImageData;
    let bytes: Uint8ClampedArray;
    let words: Uint32Array;
    let t = 0;

    const resize = () => {
      const width = canvas.getBoundingClientRect().width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const next = Math.max(
        1,
        Math.min(MAX_BACKING, Math.round(width * dpr)),
      );
      if (next === dim) return false;
      dim = next;
      canvas.width = dim;
      canvas.height = dim;
      image = ctx.createImageData(dim, dim);
      bytes = image.data;
      words = new Uint32Array(bytes.buffer);
      return true;
    };

    const draw = () => {
      words.fill(paperWord);

      const scale = dim / SPACE;
      const wave = (t * Math.PI) / 20;
      const spin = (t * Math.PI) / 480;

      let x = 9;
      let y = 9;
      let z = 9;

      for (let i = POINTS - 1; i >= 0; i--) {
        // Lorenz system, integrated with the sketch's constants
        const nx = x + 9 * (y - x) * DT;
        const ny = y + (x * (28 - z) - y) * DT;
        const nz = z + (x * y - 2 * z) * DT;
        x = nx;
        y = ny;
        z = nz;

        // every 9th point belongs to the same butterfly on the ring
        const lane = i % 9;
        const e = Math.sin(wave - (x * x) / 99 + lane) + 1;
        const q = x * e + 89;
        const k = z / 59 - e / 29 + spin + lane * 8;

        const fx = (q * Math.cos(k) + 200) * scale;
        const fy = (200 - (q + 60 * Math.cos(k / 2)) * Math.sin(k)) * scale;
        if (fx < 0 || fy < 0 || fx >= dim || fy >= dim) continue;

        const o = ((fy | 0) * dim + (fx | 0)) * 4;
        bytes[o] += (INK[0] - bytes[o]) * ALPHA;
        bytes[o + 1] += (INK[1] - bytes[o + 1]) * ALPHA;
        bytes[o + 2] += (INK[2] - bytes[o + 2]) * ALPHA;
      }

      ctx.putImageData(image, 0, 0);
    };

    resize();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw();
      const observer = new ResizeObserver(() => {
        if (resize()) draw();
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    let raf = 0;
    const loop = () => {
      t++;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
