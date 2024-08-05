"use client";
import { useRef, useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { LuMinus, LuPlus } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";

export default function Stepper() {
  const [counter, setCounter] = useState(0);
  const prevCounter = useRef<number>(0);

  const handleCount = (add: number) => {
    const newCount = counter + add;
    if (newCount < 0) return;

    prevCounter.current = counter;

    setCounter(newCount);
  };

  return (
    <ComponentWrapper>
      <div className="rounded-full bg-neutral-800 border border-neutral-700 p-1 flex gap-x-2.5 relative overflow-hidden">
        <button
          className="size-7 rounded-full bg-neutral-700 grid place-items-center disabled:opacity-40 transition-opacity"
          onClick={() => handleCount(-1)}
          aria-label="Add 1 to counter"
          disabled={counter - 1 < 0}
        >
          <LuMinus />
        </button>
        <div className="flex items-center">
          <AnimatePresence
            initial={false}
            mode="popLayout"
            custom={{ prevCounter, counter }}
          >
            {counter
              .toString()
              .split("")
              .map((char, i) => (
                <motion.span
                  key={char + i.toString()}
                  custom={{ prevCounter, counter }}
                  variants={{
                    enter: ({ prevCounter, counter }) => ({
                      y: counter > prevCounter.current ? 30 : -30,
                      filter: "blur(3px)",
                    }),
                    presence: {
                      y: 0,
                      filter: "blur(0px)",
                      //Workaround of the issue when changing the state too fast
                      //https://github.com/framer/motion/issues/2023
                      transition: { delay: 0.15 },
                    },
                    exit: ({ prevCounter, counter }) => ({
                      y: counter > prevCounter.current ? -30 : 30,
                      filter: "blur(1px)",
                      transition: {
                        duration: 0.15,
                      },
                    }),
                  }}
                  initial="enter"
                  animate="presence"
                  exit="exit"
                  transition={{ type: "spring", duration: 0.7, bounce: 0.4 }}
                  className="w-[1ch]"
                >
                  {char}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
        <button
          className="size-7 rounded-full bg-neutral-700 grid place-items-center"
          onClick={() => handleCount(1)}
          aria-label="Subtract 1 from the counter"
        >
          <LuPlus />
        </button>
      </div>
    </ComponentWrapper>
  );
}
