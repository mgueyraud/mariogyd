"use client";
import { useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { AnimatePresence, motion } from "framer-motion";

const copy = {
  idle: "Send me a login link",
  loading: <Spinner />,
  sent: "Login link sent!",
};

export default function LoginLinkButton() {
  const [buttonState, setButtonState] = useState<keyof typeof copy>("idle");

  const handleSend = async () => {
    setButtonState("loading");

    setTimeout(() => {
      setButtonState("sent");
    }, 1750);

    setTimeout(() => {
      setButtonState("idle");
    }, 3000);
  };

  return (
    <ComponentWrapper>
      <button
        className="h-8 font-semibold rounded-md w-36 text-xs bg-[#161615] hover:bg-[#1A1A19] outline outline-neutral-800 outline-offset-2 outline-1 relative overflow-hidden bg-gre"
        onClick={handleSend}
        disabled={buttonState !== "idle"}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={buttonState}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            initial={{ y: -25 }}
            animate={{ y: 0 }}
            exit={{ y: 25 }}
            className="flex w-full justify-center items-center"
          >
            {copy[buttonState]}
          </motion.span>
        </AnimatePresence>
      </button>
    </ComponentWrapper>
  );
}

function Spinner() {
  return (
    <div className="lds-spinner">
      {new Array(12).fill(0).map((_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
