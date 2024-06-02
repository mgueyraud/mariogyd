"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

let titles = [
  ["Apple's newest iPhone is here", "Watch our July event"],
  [
    "Nintendo's Newsletter for July",
    "Introducing Strike, a 5-on-5 soccer game",
  ],
  ["Your funds have been processed", "See your latest deposit online"],
  ["This Week in Sports", "The finals are heating up"],
  ["Changelog update", "Edge subroutines and more"],
  ["React Hawaii is here!", "Time for fun in the sun"],
];

export default function EmailClient() {
  const [messages, setMessages] = useState([...Array.from({ length: 9 }, (_, i) => i)]);

  function addMessage() {
    let newId = (messages.at(-1) || 0) + 1;
    setMessages((messages) => [...messages, newId]);
  }

  function archiveMessage(mid: number) {
    setMessages((messages) => messages.filter((id) => id !== mid));
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center overscroll-y-contain bg-gradient-to-br from-slate-700 to-slate-900 py-8 px-6 text-slate-600">
      <div className="mx-auto flex w-full max-w-3xl flex-1 overflow-hidden rounded-2xl bg-white ">
        <div className="flex w-[45%] flex-col bg-slate-50 py-2">
          <div className="border-b px-5">
            <div className="flex justify-between py-2 text-right">
              <button
                onClick={addMessage}
                className="-mx-2 rounded px-2 py-1 text-slate-400 hover:text-slate-500 active:bg-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </button>
            </div>
          </div>
          <ul className="overflow-y-scroll px-3 pt-2">
            <AnimatePresence initial={false}>
            {[...messages].reverse().map((mid) => (
              <motion.li
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1}}
                transition={{ type: 'spring', bounce: 0.5, duration: 1}}
                exit={{ height: 0, opacity: 0}}
                key={mid}
                className="relative py-0.5"
              >
                <button
                  onClick={() => archiveMessage(mid)}
                  className="block w-full cursor-pointer truncate rounded py-3 px-3 text-left hover:bg-slate-200"
                >
                  <p className="truncate text-sm font-medium text-slate-500">
                    {titles[mid % titles.length][0]}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {titles[mid % titles.length][1]}
                  </p>
                </button>
              </motion.li>
            ))}
            </AnimatePresence>
          </ul>
        </div>
        <div className="flex-1 overflow-y-scroll border-l px-8 py-8">
          <div className="h-8 rounded bg-slate-100 text-2xl font-bold" />
          <div className="mt-8 space-y-6">
            {[...Array.from({ length: 9 }, (_, i) => i)].map((i) => (
              <div key={i} className="space-y-2 text-sm">
                <p className="h-4 w-5/6 rounded bg-slate-100" />
                <p className="h-4 rounded bg-slate-100" />
                <p className="h-4 w-4/6 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}