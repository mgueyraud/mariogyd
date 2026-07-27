"use client";

import React from "react";
import { motion } from "framer-motion";

// Idle heights give a flat-ish "not playing" waveform.
const IDLE_HEIGHTS = [6, 10, 8, 12, 7, 11, 6, 9];

export const WaveformLoader = ({ animate = true }: { animate?: boolean }) => (
  <div className="flex items-center space-x-0.5 h-8">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-1 rounded-full bg-current"
        animate={animate ? { height: [4, 24, 4] } : { height: IDLE_HEIGHTS[i] }}
        transition={
          animate
            ? {
                duration: 1,
                repeat: Infinity,
                delay: Math.sin(i) * 0.5,
                ease: "easeInOut",
              }
            : { duration: 0.3, ease: "easeInOut" }
        }
      />
    ))}
  </div>
);
