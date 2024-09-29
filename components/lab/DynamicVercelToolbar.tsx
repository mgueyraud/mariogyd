"use client";

import { useEffect, useRef, useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { Command } from "cmdk";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { BiMessageRounded } from "react-icons/bi";
import { LuInbox } from "react-icons/lu";
import { FiToggleLeft } from "react-icons/fi";
import { AiOutlineEye, AiOutlineLayout } from "react-icons/ai";
import { FaShareSquare } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { IoAccessibilitySharp, IoDocumentTextOutline } from "react-icons/io5";
import { MdAlarm } from "react-icons/md";
import { TbWorld } from "react-icons/tb";

const CmdkMotion = motion(Command);

const exitButtonVariants: Variants = {
  exit: {
    y: 40,
    filter: "blur(8px)",
    transition: { duration: 0.6, type: "spring", bounce: 0.2 },
  },
  initial: {
    y: 40,
    filter: "blur(8px)",
  },
  enter: {
    transition: { duration: 0.6, type: "spring", bounce: 0.2 },
    y: 0,
    filter: "blur(0px)",
  },
};

export default function DynamicVercelToolbar() {
  const [open, setOpen] = useState(false);
  const containerElement = useRef<HTMLDivElement>(null);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <ComponentWrapper ref={containerElement} hasLightMode>
      <div className="relative flex flex-col justify-end items-center w-full h-full">
        <motion.div
          className="overflow-hidden w-48 h-10 bg-[#333332]"
          style={{ borderRadius: 20 }}
          animate={{
            width: open ? "100%" : "192px",
            height: open ? "100%" : "40px",
            backgroundColor: open ? "#000000" : "#333332",
          }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.1 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.div
                variants={{
                  enter: {
                    transition: {
                      staggerChildren: 0.03,
                    },
                  },
                  exit: {
                    transition: {
                      staggerChildren: 0.03,
                    },
                  },
                }}
                className="flex gap-4 py-3 px-2 overflow-hidden absolute bottom-0 left-1/2 -translate-x-1/2 text-[#e1e1e0]"
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <motion.button
                  variants={exitButtonVariants}
                  key="comments"
                  aria-label="Comments"
                >
                  <BiMessageRounded />
                </motion.button>
                <motion.button
                  key="inbox"
                  variants={exitButtonVariants}
                  aria-label="Inbox"
                  className="relative"
                >
                  <div className="size-[7px] rounded-full bg-[#1691fe] absolute top-0 right-0 border-[1.5px] border-[#333332]" />
                  <LuInbox />
                </motion.button>
                <motion.button
                  variants={exitButtonVariants}
                  aria-label="Feature flags"
                >
                  <FiToggleLeft />
                </motion.button>
                <motion.button
                  variants={exitButtonVariants}
                  aria-label="Draft mode"
                >
                  <AiOutlineEye />
                </motion.button>
                <motion.button variants={exitButtonVariants} aria-label="Share">
                  <FaShareSquare />
                </motion.button>
                <motion.button
                  variants={exitButtonVariants}
                  aria-label="Menu"
                  onClick={() => setOpen(true)}
                  className="relative"
                >
                  <div className="size-[7px] rounded-full bg-[#1691fe] absolute top-0 right-0 border-[1.5px] border-[#333332]" />
                  <IoMdMenu />
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {open ? (
              <CmdkMotion
                label="Global Command Menu"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.15 }}
                className="w-full p-6"
              >
                <span className="px-2 py-1 rounded-sm text-[#747475] bg-[#1b1a1b] text-xs border border-[#2b2b2b]">
                  Vercel Toolbar
                </span>
                <Command.Input
                  placeholder="What do you need?"
                  autoFocus
                  className="bg-transparent border-b border-[#1b1a1b] pb-4 text-xl w-full outline-none mt-4 font-light placeholder:text-[#696869]"
                />
                <Command.List>
                  <Command.Empty className="mt-4 text-[#a3a2a2]">
                    No results found.
                  </Command.Empty>

                  <Command.Group
                    heading="Developer tools"
                    className="[&>*:first-child]:text-xs [&>*:first-child]:font-light [&>*:first-child]:text-[#747475] [&>*:first-child]:my-3"
                  >
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <AiOutlineLayout />
                      <span>Layout Shifts</span>
                    </Command.Item>
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <MdAlarm />
                      <span>Interaction Timing</span>
                    </Command.Item>
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <IoAccessibilitySharp />
                      <span>Accessibility</span>
                    </Command.Item>
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <IoDocumentTextOutline />
                      <span>Bundle Size</span>
                    </Command.Item>
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <TbWorld />
                      <span>Open Graph</span>
                    </Command.Item>
                  </Command.Group>

                  <Command.Group
                    heading="Toolbar tools"
                    className="[&>*:first-child]:text-xs [&>*:first-child]:font-light [&>*:first-child]:text-[#747475] [&>*:first-child]:my-3"
                  >
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <BiMessageRounded />
                      <span>Comment</span>
                    </Command.Item>
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <FiToggleLeft />
                      <span>Feature Flags</span>
                    </Command.Item>
                    <Command.Separator />
                    <Command.Item className="flex items-center gap-2 my-3 text-[#a3a2a2]">
                      <AiOutlineEye />
                      <span>Draft Mode</span>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </CmdkMotion>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </ComponentWrapper>
  );
}
