"use client";

import { useEffect, useState } from "react";

/**
 * Tracks a media query and keeps following it. Starts `false` so the server
 * render and the first client render agree; the effect corrects it before
 * paint. Anything that must not happen for a matching visitor should
 * therefore be driven by this value rather than rendered-then-stopped.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * `prefers-reduced-motion`, kept live — the setting can be flipped mid-visit
 * (macOS does it when you toggle "Reduce motion"), so a one-shot read on
 * mount would go stale.
 */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Phone-sized viewports: below Tailwind's `md` breakpoint. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
