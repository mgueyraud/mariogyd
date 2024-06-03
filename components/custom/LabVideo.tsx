"use client";
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
    src: string
}

export default function LabVideo({ src }: Props) {
  return (
    <div className='rounded-lg border-white hover:border'>
        <video
            loop 
            muted
            autoPlay
            src={src}
            controls={false}
            className='rounded-md touch-none select-none'
        ></video>
    </div>
  )
}