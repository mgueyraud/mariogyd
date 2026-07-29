"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion` and keeps following it — the setting can be
 * flipped mid-visit (macOS does it when you toggle "Reduce motion"), so a
 * one-shot read on mount would go stale.
 *
 * Starts `false` so the server render and the first client render agree; the
 * effect corrects it before paint. Anything that must not move for a
 * reduced-motion visitor should therefore be driven by this value rather than
 * rendered-then-stopped.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
