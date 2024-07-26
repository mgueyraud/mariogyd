"use client";
import { useEffect, useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { GrDocumentPdf, GrTicket } from "react-icons/gr";
import { RiTreeFill } from "react-icons/ri";
import { PiBackpack } from "react-icons/pi";
import { AnimatePresence, motion } from "framer-motion";
import { MdClear } from "react-icons/md";
import { LuDownload } from "react-icons/lu";
import { IoTrash } from "react-icons/io5";
import { IoMdCheckmarkCircle } from "react-icons/io";

const items = [
  {
    name: "document",
    icon: <GrDocumentPdf className="size-5" />,
  },
  {
    name: "ticket",
    icon: <GrTicket className="size-5" />,
  },
  {
    name: "tree",
    icon: <RiTreeFill className="size-5" />,
  },
  {
    name: "backpack",
    icon: <PiBackpack className="size-5" />,
  },
];

export default function DownloadInteraction() {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "downloading" | "downloaded">(
    "idle"
  );

  useEffect(() => {
    if (status === "downloading") {
      setInterval(() => {
        setStatus("downloaded");
      }, 3000);
    }
  }, [status]);

  return (
    <ComponentWrapper>
      <div className="relative">
        <div className="grid gap-5 grid-cols-2">
          {items.map(({ name, icon }) => (
            <button
              key={name}
              aria-label={"Download " + name}
              className="size-24 rounded-lg bg-zinc-900 grid place-items-center relative"
              onClick={() => {
                if (selected.includes(name)) {
                  setSelected((arr) => arr.filter((val) => val !== name));
                } else {
                  setSelected((arr) => [name, ...arr]);
                }
              }}
            >
              <AnimatePresence>
                {selected.includes(name) ? (
                  <motion.svg
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="absolute top-2 right-2 size-4 text-green-400 text-red"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clip-rule="evenodd"
                    />
                  </motion.svg>
                ) : null}
              </AnimatePresence>
              {icon}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {selected.length > 0 && status == "idle" ? (
            <motion.div
              variants={{
                visible: { scale: 1, y: 0, opacity: 1 },
                hidden: { scale: 0.9, y: 20, opacity: 0 },
              }}
              layoutId="background"
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-zinc-900 px-6 h-12 rounded-full flex w-fit gap-6 mx-auto absolute top-[calc(100%+2rem)] inset-x-0"
            >
              <button
                className="grid place-items-center"
                aria-label="Clear items"
                onClick={() => setSelected([])}
              >
                <MdClear />
              </button>
              <button
                className="grid place-items-center"
                aria-label="Download items"
                onClick={() => setStatus("downloading")}
              >
                <LuDownload />
              </button>
              <button
                className="grid place-items-center"
                aria-label="Delete items"
              >
                <IoTrash color="#ef4444" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {status == "downloading" || status === "downloaded" ? (
          <motion.div
            layoutId="background"
            animate={{
              backgroundColor: status === "downloading" ? "#18181b" : "#4ade80",
            }}
            className="bg-zinc-900 h-12 rounded-full gap-6 mx-auto absolute top-[calc(100%+2rem)] w-full inset-x-0 grid place-items-center overflow-hidden"
          >
            <AnimatePresence mode="popLayout">
              {status === "downloading" ? (
                <div className="relative w-full h-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className="h-full bg-white/5 absolute top-0 left-0"
                    transition={{ duration: 3 }}
                  />
                  {status === "downloading" ? (
                    <motion.span
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ y: -50 }}
                      layout="position"
                      className="text-xs text-zinc-300 font-medium absolute inset-0 grid place-items-center"
                    >
                      Downloading...
                    </motion.span>
                  ) : null}
                </div>
              ) : null}
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {status === "downloaded" ? (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout="position"
                  className="flex items-center gap-2"
                >
                  <IoMdCheckmarkCircle color="black" />
                  <span className="text-xs text-black font-medium">
                    Download Complete
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </ComponentWrapper>
  );
}
