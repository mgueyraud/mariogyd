"use client";
import ComponentWrapper from "../custom/ComponentWrapper";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BsFullscreen } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";

export default function MemoryCards() {
  const [status, setStatus] = useState<"idle" | "shuffle" | "show">("idle");

  useEffect(() => {
    if (status === "shuffle") {
      setTimeout(() => {
        setStatus("show");
      }, 370);
    }
  }, [status]);

  const toggleStatus = () => {
    if (status === "show") {
      setStatus("idle");
    } else if (status === "idle") {
      setStatus("shuffle");
    }
  };

  return (
    <ComponentWrapper>
      <div className="flex flex-col w-full items-center">
        <div className="text-center mb-10 overflow-hidden relative w-56 h-9">
          <AnimatePresence mode="popLayout" initial={false}>
            {status !== "show" ? (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                layout="position"
                key="idle-state"
              >
                <p className="font-semibold leading-4 mb-1">Revisit memories</p>
                <p className="font-semibold leading-4 text-zinc-400">
                  2 years ago
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="date"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="font-semibold leading-4 mb-1"
              >
                Aug 2, 2024
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="h-52">
          <AnimatePresence mode="popLayout" initial={false}>
            {status !== "show" ? (
              <div className="relative">
                <motion.div
                  animate={{
                    transform:
                      status === "shuffle"
                        ? "rotate(0deg) scale(0.7) translate(0,-25px)"
                        : "rotate(6deg) scale(0.7) translate(76px, -15px)",
                  }}
                  exit={{
                    opacity: 0,
                    transform: "translate(0,0) rotate(0deg) scale(0.7)",
                    transition: { duration: 0.2 },
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-2 text-black font-semibold absolute -top-7 z-0"
                >
                  <Image
                    src="/images/trash-interaction-3.jpg"
                    width={96}
                    height={96}
                    alt="Mountain hills"
                    className="size-32 object-cover"
                  />
                  <p className="mt-1 mb-3 text-sm">Nature</p>
                </motion.div>
                <motion.div
                  animate={{
                    transform:
                      status === "shuffle"
                        ? "rotate(0deg) scale(0.75) translate(0,-20px)"
                        : "rotate(-6deg) scale(0.75) translate(-65px, -5px)",
                  }}
                  exit={{
                    opacity: 0,
                    transform: "translate(0,0) rotate(0deg) scale(0.75)",
                    transition: { duration: 0.2 },
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-2 text-black font-semibold absolute -top-4 z-0"
                >
                  <Image
                    src="/images/trash-interaction-2.jpg"
                    width={96}
                    height={96}
                    alt="Mountain hills"
                    className="size-32 object-cover"
                  />
                  <p className="mt-1 mb-3 text-sm">Mountains</p>
                </motion.div>
                <motion.div
                  layoutId="bg-white"
                  className="bg-white p-2 text-black font-semibold z-30 relative"
                >
                  <motion.img
                    src="/images/trash-interaction-1.jpg"
                    alt="Mountain hills"
                    className="size-32 object-cover"
                    layoutId="img"
                  />
                  <motion.p
                    layout="position"
                    layoutId="image-name"
                    className="mt-1 mb-3 text-sm"
                  >
                    Greenfields
                  </motion.p>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>
          {status === "show" ? (
            <motion.div
              layoutId="bg-white"
              transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
              className="bg-white text-black font-semibold z-30 relative p-1 overflow-hidden"
            >
              <motion.img
                src="/images/trash-interaction-1.jpg"
                alt="Mountain hills"
                className="size-52 object-cover"
                layoutId="img"
                transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
              />
              <motion.p
                layoutId="image-name"
                layout="position"
                className="text-sm absolute left-3 bottom-3 text-white"
                transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
              >
                Greenfields
              </motion.p>
              <motion.div
                className="absolute text-white z-40"
                initial={{ right: -20, bottom: -20 }}
                animate={{ right: 16, bottom: 16 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.2 }}
              >
                <BsFullscreen className="size-4" />
              </motion.div>
            </motion.div>
          ) : null}
        </div>
        <AnimatePresence initial={false}>
          <motion.button
            className="h-10 text-sm font-medium rounded-full mt-10 mx-auto flex items-center justify-center"
            animate={{
              width: status === "idle" ? "96px" : "40px",
              backgroundColor: status === "idle" ? "#18181b" : "#3f3f46",
            }}
            onClick={toggleStatus}
          >
            {status === "idle" ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Start
              </motion.span>
            ) : (
              <IoCloseOutline className="size-4" />
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </ComponentWrapper>
  );
}
