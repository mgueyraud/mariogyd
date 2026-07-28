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
      className="relative h-full w-full overflow-hidden group"
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
        className="pointer-events-none h-full w-full touch-none select-none object-cover"
      ></video>
      <div className="absolute inset-0 grid place-items-center bg-black/70 text-white opacity-0 transition duration-300 group-hover:opacity-100">
        <GoLinkExternal className="size-6" />
      </div>
    </div>
  );
}
