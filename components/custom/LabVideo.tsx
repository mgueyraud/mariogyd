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
            className='rounded-md'
        ></video>
    </div>
  )
}