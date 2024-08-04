"use client";
import React, { useRef } from "react";
import { GoLinkExternal } from "react-icons/go";

type Props = {
  src: string;
};

export default function LabVideo({ src }: Props) {
  const refVideo = useRef<HTMLVideoElement>(null);

  const stopVideo = () => {
    refVideo.current?.pause();
  };

  const playVideo = () => {
    refVideo.current?.play();
  };

  return (
    <div
      className="rounded-lg overflow-hidden relative group"
      onMouseEnter={() => stopVideo()}
      onMouseLeave={() => playVideo()}
    >
      <video
        ref={refVideo}
        loop
        muted
        autoPlay
        playsInline
        src={src}
        controls={false}
        className="touch-none select-none pointer-events-none"
      ></video>
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 grid place-items-center transition duration-300">
        <GoLinkExternal className="size-8" />
      </div>
    </div>
  );
}
