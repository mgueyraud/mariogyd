"use client";

import { play } from "cuelume";
import { WaveformLoader } from "@/components/ui/waveform-loader";

// Spotify "now playing" footer — a mockup (no live Spotify integration).
// `playing` toggles the active (green dot, animated) vs idle (gray dot,
// static, "last played") states.
export default function NowPlaying({ playing = true }: { playing?: boolean }) {
  return (
    <footer className="mt-[140px] flex items-center justify-between gap-4 border-t border-line pt-[18px]">
      <div
        className="flex items-center gap-2.5 font-mono text-[11px] text-faint"
        onMouseEnter={() => play("bloom")}
      >
        <span
          className="inline-block h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: playing ? "oklch(0.65 0.15 150)" : "#C9C9C0" }}
          aria-hidden
        />
        <span
          className="inline-flex items-end overflow-hidden"
          style={{ width: 20, height: 14 }}
          aria-hidden
        >
          <span className="origin-bottom-left scale-[0.42]">
            <WaveformLoader animate={playing} />
          </span>
        </span>
        <span>
          {playing ? "" : "last played · "}Vessel — Jon Hopkins
        </span>
      </div>
      <div className="font-mono text-[11px] text-faint">Asunción, Paraguay</div>
    </footer>
  );
}
