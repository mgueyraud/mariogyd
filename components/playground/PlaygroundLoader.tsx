"use client";
import dynamic from "next/dynamic";

// Client-only so Playground's first import (Lapse's clock patch) runs in the
// browser before motion and anything else caches requestAnimationFrame.
const Playground = dynamic(() => import("./Playground"), { ssr: false });

export default function PlaygroundLoader() {
  return <Playground />;
}
