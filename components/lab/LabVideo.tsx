"use client";
import React, { useEffect, useRef } from "react";
import { GoLinkExternal } from "react-icons/go";

type Props = {
  src: string;
};

export default function LabVideo({ src }: Props) {
  const refVideo = useRef<HTMLVideoElement>(null);
  // Hovered cards hold on a frame. Tracked here so a card that scrolls back
  // into view while hovered stays paused instead of being restarted.
  const hovered = useRef(false);
  const visible = useRef(false);

  const sync = () => {
    const v = refVideo.current;
    if (!v) return;
    if (visible.current && !hovered.current) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  // A page of these would otherwise all decode at once, on screen or not.
  // Only the ones in (or just below) the viewport play.
  useEffect(() => {
    const v = refVideo.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        sync();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="group relative h-full w-full overflow-hidden"
      onMouseEnter={() => {
        hovered.current = true;
        sync();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        sync();
      }}
    >
      <video
        ref={refVideo}
        loop
        muted
        playsInline
        preload="metadata"
        src={src}
        controls={false}
        className="pointer-events-none h-full w-full touch-none select-none object-cover"
      />
      <div className="absolute inset-0 grid place-items-center bg-black/70 text-white opacity-0 transition-opacity duration-300 group-hoverable:opacity-100">
        <GoLinkExternal className="size-6" />
      </div>
    </div>
  );
}
