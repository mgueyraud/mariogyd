"use client";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import ComponentWrapper from "../custom/ComponentWrapper";

const statusVariants: Record<string, { icon: React.ReactElement }> = {
  analyzing: {
    icon: <CgSpinner className="size-4 animate-spin duration-300" />,
  },
  success: {
    icon: <FaCheckCircle className="size-4" />,
  },
};

export default function FamilyTransaction() {
  const [status, setStatus] = useState("analyzing");

  return (
    <ComponentWrapper>
      <div className="flex flex-col justify-center items-center">
        <Button
          className="mb-8"
          variant="secondary"
          onClick={() =>
            setStatus(status === "success" ? "analyzing" : "success")
          }
        >
          Toggle state
        </Button>
        <MotionConfig transition={{ duration: 0.6, type: "spring", bounce: 0 }}>
          <motion.div
            layout
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 100,
            }}
            initial={{
              width: 210,
            }}
            animate={{
              width: status === "analyzing" ? 210 : 170,
            }}
            className={cn(
              "font-sans px-4 py-3 rounded-[20px] font-semibold text-sm relative overflow-hidden justify-between leading-4 flex w-fit",
              {
                "bg-cyan-200 text-cyan-500": status === "analyzing",
                "bg-green-200 text-green-600": status === "success",
              }
            )}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={status}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                layout="position"
                className="flex items-center"
              >
                {statusVariants[status].icon}
              </motion.div>
            </AnimatePresence>
            <div className="flex">
              <AnimatePresence initial={false} mode="popLayout">
                {status === "analyzing" ? (
                  <motion.div
                    layout="position"
                    initial={{ opacity: 0, x: -70 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -70 }}
                  >
                    Analyzing
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <motion.div layout>&nbsp;Transaction&nbsp;</motion.div>
              <AnimatePresence initial={false} mode="popLayout">
                {status === "success" ? (
                  <motion.div
                    layout="position"
                    initial={{ opacity: 0, x: 70 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 70 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                  >
                    Safe
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      </div>
    </ComponentWrapper>
  );
}
