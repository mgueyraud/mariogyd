"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { play } from "cuelume";
import { WaveformLoader } from "@/components/ui/waveform-loader";
import type { NowPlayingState } from "@/lib/spotify";

// Type-only import above — erased at compile time, so no server code or env
// access reaches the client bundle.

const POLL_MS = 60_000;
// Floor between a visibility-triggered refetch and the last one, so tabbing
// back and forth can't hammer the route.
const MIN_SPACING_MS = 30_000;

const GREEN = "oklch(0.65 0.15 150)";
const GRAY = "#C9C9C0";

function usePrefersReducedMotion() {
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

export default function NowPlaying({ initial }: { initial: NowPlayingState }) {
  const [state, setState] = useState<NowPlayingState>(initial);
  const lastFetchedAt = useRef(Date.now());
  const reducedMotion = usePrefersReducedMotion();

  // The first paint must render the text opaque — server-side and during
  // hydration — so it's visible even if JS never runs. Only track *changes*
  // cross-fade.
  const firstPaint = useRef(true);
  useEffect(() => {
    firstPaint.current = false;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async (): Promise<void> => {
      lastFetchedAt.current = Date.now();
      try {
        const res = await fetch("/api/now-playing", {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const next = (await res.json()) as NowPlayingState;
        setState((prev) =>
          // Never degrade from a good value to an error state.
          next.status === "unavailable" && prev.status !== "unavailable"
            ? prev
            : next
        );
      } catch {
        // Swallow — keep showing the last good value.
      }
    };

    const start = () => {
      timer = setInterval(refresh, POLL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastFetchedAt.current >= MIN_SPACING_MS) refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") {
      // The page is ISR with a long window, so `initial` can be minutes old.
      // One fetch on mount corrects it within a round trip; the route's
      // s-maxage=30 header keeps this off Spotify for most visitors.
      refresh();
      start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const isPlaying = state.status === "playing";
  const track = state.status === "unavailable" ? null : state.track;
  const label = track
    ? `${isPlaying ? "" : "last played · "}${track.title} — ${track.artist}`
    : null;

  return (
    <footer className="mt-[140px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t border-line pt-[18px]">
      <div
        className="flex min-w-0 items-center gap-2.5 font-mono text-[11px] text-faint"
        onMouseEnter={() => play("bloom")}
      >
        <span
          className="inline-block h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: isPlaying ? GREEN : GRAY }}
          aria-hidden
        />
        <span
          className="inline-flex flex-none items-end overflow-hidden"
          style={{ width: 20, height: 14 }}
          aria-hidden
        >
          <span className="origin-bottom-left scale-[0.42]">
            <WaveformLoader animate={isPlaying && !reducedMotion} />
          </span>
        </span>
        {label ? (
          <motion.span
            // Re-keying on the label replays the fade, so a track change
            // cross-fades instead of popping.
            key={label}
            className="truncate"
            initial={firstPaint.current || reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {track?.url ? (
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline transition-colors hover:text-ink"
              >
                {label}
              </a>
            ) : (
              label
            )}
          </motion.span>
        ) : null}
      </div>
      <div className="flex-none font-mono text-[11px] text-faint">
        Asunción, Paraguay
      </div>
    </footer>
  );
}
