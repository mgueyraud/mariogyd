"use client";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const statusVariants: Record<string, {icon: React.ReactElement}> = {
    analyzing: {
      icon: (
        <CgSpinner className="size-4 animate-spin"/>
      ),
    },
    success: {
      icon: (
        <FaCheckCircle className="size-4"/>
      ),
    },
  };

export default function FamilyTransaction() {

    const [status, setStatus] = useState("analyzing");

    return (
        <div
            className="flex h-screen flex-col justify-center items-center"
        >
          <Button
            className="mb-8"
            variant='secondary'
            onClick={() =>
              setStatus(status === "success" ? "analyzing" : "success")
            }
          >
            Toggle state
          </Button>
          <MotionConfig transition={{ type: "spring", bounce: 0, duration: 1 }}>
            <motion.div layout className={cn('font-sans px-4 py-3 rounded-[20px] font-semibold text-sm relative overflow-hidden gap-2 leading-4 flex w-fit', {
                'bg-cyan-200 text-cyan-500': status === 'analyzing',
                'bg-green-200 text-green-600': status === 'success'
            })}>
              <AnimatePresence initial={false} mode="popLayout" custom={status}>
                <motion.div
                  key={`icon-${status}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  layout="position"
                  className="flex items-center"
                >
                  {statusVariants[status].icon}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence initial={false}>
                <div className="flex">
                  {status === "analyzing" ? (
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                    >
                      Analyzing
                    </motion.div>
                  ) : null}
                  <motion.div layout>
                    &nbsp;Transaction&nbsp;
                  </motion.div>
                  {status === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                    >
                      Safe
                    </motion.div>
                  ) : null}
                </div>
              </AnimatePresence>
            </motion.div>
          </MotionConfig>
        </div>
      );
}