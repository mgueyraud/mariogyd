"use client";
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
    src: string
}

export default function LabVideo({ src }: Props) {
  return (
    <motion.div
        initial={{ borderWidth: 0, padding: 0 }} 
        whileHover={{ borderWidth: 2, padding: 5}}
        transition={{ type: 'tween', ease: 'easeOut' }}
        className='rounded-lg border-white'
    >
        <video
            loop 
            muted
            autoPlay
            src={src}
            className='rounded-md'
        ></video>
    </motion.div>
  )
}