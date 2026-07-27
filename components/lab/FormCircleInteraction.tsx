"use client";
import { motion } from "framer-motion";
import ComponentWrapper from "../custom/ComponentWrapper";

export default function FormCircleInteraction() {
  return (
    <ComponentWrapper>
      <div className="w-full h-full">
        <Circle />
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full absolute inset-0"
          initial={{ rotate: "0deg" }}
          animate={{ rotate: "360deg" }}
          transition={{ duration: 10 }}
        >
          <circle r="0.25" cx="50" cy="23" fill="white" />
          <circle r="0.25" cx="50" cy="77" fill="white" />
          <circle r="0.25" cx="23" cy="50" fill="white" />
          <circle r="0.25" cx="77" cy="50" fill="white" />
          <circle r="0.25" cx="31.5" cy="31.5" fill="white" />
          <circle r="0.25" cx="31.5" cy="69.5" fill="white" />
          <circle r="0.25" cx="69.5" cy="31.5" fill="white" />
          <circle r="0.25" cx="69.5" cy="69.5" fill="white" />
        </motion.svg>
      </div>
    </ComponentWrapper>
  );
}

const Circle = () => {
  return (
    <>
      <svg viewBox="0 0 100 100" className="w-full absolute inset-0">
        <circle
          r="30"
          cx="50"
          cy="50"
          fill="none"
          strokeWidth="0.2"
          opacity="0.09"
          stroke="white"
        />
      </svg>
      <svg viewBox="0 0 100 100" className="w-full absolute inset-0">
        <motion.circle
          r="30"
          cx="50"
          cy="50"
          fill="none"
          strokeWidth="0.3  "
          strokeDasharray={189}
          strokeDashoffset={189}
          stroke="white"
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          initial={{ strokeDashoffset: 189 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 10 }}
        />
      </svg>
    </>
  );
};
