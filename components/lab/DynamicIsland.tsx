"use client";
import { useEffect, useMemo, useState } from "react";
import ComponentWrapper, { useTheme } from "../custom/ComponentWrapper";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";

const BOUNCE_VARIANTS: Record<string, number> = {
  idle: 0.5,
  "ring-idle": 0.5,
  "timer-ring": 0.35,
  "ring-timer": 0.35,
  "timer-idle": 0.3,
  "idle-timer": 0.3,
  "idle-ring": 0.5,
};

const ANIMATION_VARIANTS = {
  "ring-idle": {
    scale: 0.9,
    scaleX: 0.9,
    bounce: 0.5,
  },
  "timer-ring": {
    scale: 0.7,
    y: -7.5,
    bounce: 0.35,
  },
  "ring-timer": {
    scale: 1.4,
    y: 7.5,
    bounce: 0.35,
  },
  "timer-idle": {
    scale: 0.7,
    y: -7.5,
    bounce: 0.3,
  },
};

const variants = {
  exit: (transition: any) => {
    return {
      ...transition,
      opacity: [1, 0],
      filter: "blur(5px)",
    };
  },
};

export default function DynamicIsland() {
  const [view, setView] = useState("idle");
  const [variantKey, setVariantKey] = useState("idle");
  const theme = useTheme();

  const content = useMemo(() => {
    switch (view) {
      case "ring":
        return <Ring />;
      case "timer":
        return <Timer />;
      case "idle":
        return <div className="h-7" />;
    }
  }, [view]);

  return (
    <ComponentWrapper hasLightMode>
      <div className="h-full w-full flex flex-col justify-between py-20">
        <div className="relative flex h-full w-full flex-col justify-between">
          <motion.div
            layout
            transition={{
              type: "spring",
              bounce: BOUNCE_VARIANTS[variantKey],
            }}
            style={{ borderRadius: 32 }}
            className="mx-auto w-fit min-w-[100px] overflow-hidden rounded-full bg-black"
          >
            <motion.div
              transition={{
                type: "spring",
                bounce: BOUNCE_VARIANTS[variantKey],
              }}
              initial={{
                scale: 0.9,
                opacity: 0,
                filter: "blur(5px)",
                originX: 0.5,
                originY: 0.5,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                originX: 0.5,
                originY: 0.5,
                transition: {
                  delay: 0.05,
                },
              }}
              key={view}
            >
              {content}
            </motion.div>
          </motion.div>
          <div className="pointer-events-none absolute left-1/2 top-0 flex h-[200px] w-[300px] -translate-x-1/2 items-start justify-center">
            <AnimatePresence
              mode="popLayout"
              custom={
                ANIMATION_VARIANTS[
                  variantKey as keyof typeof ANIMATION_VARIANTS
                ]
              }
            >
              <motion.div
                initial={{ opacity: 0 }}
                exit="exit"
                variants={variants}
                key={view}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex gap-3 w-full justify-center">
          <Button
            variant={theme === "dark" ? "secondary" : "default"}
            onClick={() => {
              setView("idle");
              setVariantKey(`${view}-idle`);
            }}
            className="w-20 rounded-full"
          >
            Idle
          </Button>
          <Button
            variant={theme === "dark" ? "secondary" : "default"}
            onClick={() => {
              setView("ring");
              setVariantKey(`${view}-ring`);
            }}
            className="w-20 rounded-full"
          >
            Ring
          </Button>
          <Button
            variant={theme === "dark" ? "secondary" : "default"}
            onClick={() => {
              setView("timer");
              setVariantKey(`${view}-timer`);
            }}
            className="w-20 rounded-full"
          >
            Timer
          </Button>
        </div>
      </div>
    </ComponentWrapper>
  );
}

//
//
// --------------- Ring component ---------------
//
//

export function Ring() {
  const [isSilent, setIsSilent] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsSilent((s) => !s);
    }, 2000);

    return () => clearTimeout(id);
  }, [isSilent]);

  return (
    <motion.div
      className="relative flex h-7 items-center justify-between px-2.5"
      animate={{ width: isSilent ? 148 : 128 }}
      transition={{ type: "spring", bounce: 0.5 }}
    >
      <AnimatePresence>
        {isSilent ? (
          <motion.div
            initial={{ width: 0, opacity: 0, filter: "blur(4px)" }}
            animate={{
              width: 40,
              opacity: 1,
              filter: "blur(0px)",
            }}
            exit={{ width: 0, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", bounce: 0.35 }}
            className="absolute left-[5px] h-[18px] w-10 rounded-full bg-[#FD4F30]"
          />
        ) : null}
      </AnimatePresence>
      <motion.div
        initial={false}
        className="relative h-[12.75px] w-[11.25px]"
        animate={{
          rotate: isSilent
            ? [0, -15, 5, -2, 0]
            : [0, 20, -15, 12.5, -10, 10, -7.5, 7.5, -5, 5, 0],
          x: isSilent ? 9 : 0,
        }}
      >
        <svg
          className="absolute inset-0"
          width="11.25"
          height="12.75"
          viewBox="0 0 15 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.17969 13.3125H13.5625C14.2969 13.3125 14.7422 12.9375 14.7422 12.3672C14.7422 11.5859 13.9453 10.8828 13.2734 10.1875C12.7578 9.64844 12.6172 8.53906 12.5547 7.64062C12.5 4.64062 11.7031 2.57812 9.625 1.82812C9.32812 0.804688 8.52344 0 7.36719 0C6.21875 0 5.40625 0.804688 5.11719 1.82812C3.03906 2.57812 2.24219 4.64062 2.1875 7.64062C2.125 8.53906 1.98438 9.64844 1.46875 10.1875C0.789062 10.8828 0 11.5859 0 12.3672C0 12.9375 0.4375 13.3125 1.17969 13.3125ZM7.36719 16.4453C8.69531 16.4453 9.66406 15.4766 9.76562 14.3828H4.97656C5.07812 15.4766 6.04688 16.4453 7.36719 16.4453Z"
            fill="white"
          />
        </svg>
        {isSilent ? (
          <div className="absolute inset-0 h-5 -translate-y-[5px] translate-x-[5px] rotate-[-40deg]">
            <div className="h-4 w-fit rounded-full">
              <div className="flex h-full w-[3px] items-center justify-center rounded-full bg-[#FD4F30]">
                <div className="h-full w-[0.75px] rounded-full bg-white" />
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
      <div className="ml-auto flex items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {isSilent ? (
            <motion.span
              key="silent"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              className="text-xs font-medium text-[#FD4F30]"
            >
              Silent
            </motion.span>
          ) : (
            <motion.span
              key="ring"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              className="text-xs font-medium text-white"
              style={{ originX: "right" }}
            >
              Ring
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

//
//
// --------------- Timer component ---------------
//
//

export function Timer() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex w-[284px] items-center gap-2 py-3 pl-3.5 pr-5">
      <motion.button
        aria-label="Pause timer"
        onClick={() => setIsPaused((p) => !p)}
        whileTap={{ scale: 0.9 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5A3C07] transition-colors hover:bg-[#694608]"
      >
        <AnimatePresence initial={false} mode="wait">
          {isPaused ? (
            <motion.svg
              key="play"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ duration: 0.1 }}
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current text-[#FDB000]"
            >
              <path d="M0.9375 13.2422C1.25 13.2422 1.51562 13.1172 1.82812 12.9375L10.9375 7.67188C11.5859 7.28906 11.8125 7.03906 11.8125 6.625C11.8125 6.21094 11.5859 5.96094 10.9375 5.58594L1.82812 0.3125C1.51562 0.132812 1.25 0.015625 0.9375 0.015625C0.359375 0.015625 0 0.453125 0 1.13281V12.1172C0 12.7969 0.359375 13.2422 0.9375 13.2422Z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="pause"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ duration: 0.1 }}
              viewBox="0 0 10 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current text-[#FDB000]"
            >
              <path d="M1.03906 12.7266H2.82031C3.5 12.7266 3.85938 12.3672 3.85938 11.6797V1.03906C3.85938 0.328125 3.5 0 2.82031 0H1.03906C0.359375 0 0 0.359375 0 1.03906V11.6797C0 12.3672 0.359375 12.7266 1.03906 12.7266ZM6.71875 12.7266H8.49219C9.17969 12.7266 9.53125 12.3672 9.53125 11.6797V1.03906C9.53125 0.328125 9.17969 0 8.49219 0H6.71875C6.03125 0 5.67188 0.359375 5.67188 1.03906V11.6797C5.67188 12.3672 6.03125 12.7266 6.71875 12.7266Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
      <button
        aria-label="Exit"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3C3D3C] text-white transition-colors hover:bg-[#4A4B4A]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="ml-auto flex items-baseline gap-1.5 pr-0.5 text-[#F7A815]">
        <span className="text-sm font-medium leading-none text-inherit">
          Timer
        </span>
        <Counter paused={isPaused} />
      </div>
    </div>
  );
}

function Counter({ paused }: { paused?: boolean }) {
  const [count, setCount] = useState(60);

  useEffect(() => {
    if (paused) return;

    const id = setInterval(() => {
      setCount((c) => {
        if (c === 0) {
          return 60;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [paused]);

  const countArray = count.toString().padStart(2, "0").split("");

  return (
    <div className="relative w-[64px] overflow-hidden whitespace-nowrap text-3xl font-light">
      0:
      <AnimatePresence initial={false} mode="popLayout">
        {countArray.map((n, i) => (
          <motion.div
            className="inline-block tabular-nums"
            key={n + i}
            initial={{ y: "12px", filter: "blur(2px)", opacity: 0 }}
            animate={{ y: "0", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "-12px", filter: "blur(2px)", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.35 }}
          >
            {n}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
