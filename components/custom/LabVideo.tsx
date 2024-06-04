"use client";
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
    src: string
}

export default function LabVideo({ src }: Props) {
  return (
    <motion.div 
        initial={{ boxShadow: "none" }}
        whileHover={{ boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", }}
        whileTap={{ boxShadow: "0 0 12px rgba(255, 255, 255, 0.2)" }}
        className='rounded-lg overflow-hidden'
    >
        <video
            loop 
            muted
            autoPlay
            playsInline
            src={src}
            controls={false}
            className='touch-none select-none pointer-events-none'
        ></video>
    </motion.div>
  )
}