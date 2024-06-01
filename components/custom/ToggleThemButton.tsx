"use client";
import React, { useState } from 'react'
import { Button } from '../ui/button'
import SunIcon from '@/icons/SunIcon'
import MoonIcon from '@/icons/MoonIcon'
import { AnimatePresence, motion } from "framer-motion"

export default function ToggleThemButton() {

    const [theme, setTheme] = useState('dark');


    const handleClick = () => {
        const htmlElement = document.querySelector('html');
        if (htmlElement) {
            const currentTheme = htmlElement.dataset.theme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlElement.dataset.theme = newTheme;
            setTheme(newTheme);
        }
    }


  return (
    <Button
        variant='ghost'
        className="absolute top-2 right-1 dark:text-white md:top-5 md:right-5"
        aria-label="Change theme"
        onClick={handleClick}
    >
        <AnimatePresence initial={false} mode='wait'>
            <motion.div
                key={theme}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.2 }}
            >
                {theme === 'dark' ? 
                    <SunIcon className="size-6"/> : 
                    <MoonIcon className="size-6"/>
                }
            </motion.div>
        </AnimatePresence>
    </Button>
  )
}