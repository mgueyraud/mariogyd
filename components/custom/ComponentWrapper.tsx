"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, forwardRef, useContext, useState } from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";

type Props = {
  children: React.ReactElement;
  hasLightMode?: boolean;
};

type ThemeContextType = "light" | "dark";

const ThemeContext = createContext<ThemeContextType>("light");

const ComponentWrapper = forwardRef<HTMLDivElement, Props>(function Wrapper(
  { children, hasLightMode = false },
  ref
) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    setTheme((m) => (m === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={clsx(
        "border p-5 rounded-md aspect-square flex justify-center items-center my-6 relative transition",
        // Demos are built for a dark canvas, so the wrapper owns the text color
        // too — children that don't set one would otherwise inherit the page's
        // `text-ink` and disappear against the dark background.
        theme === "dark"
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper text-ink"
      )}
      ref={ref}
    >
      {hasLightMode ? (
        <button className="absolute top-5 right-6 z-50" onClick={toggleTheme}>
          <div className="relative">
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                variants={{
                  visible: {
                    scale: 1,
                    filter: "blur(0px)",
                  },
                  hidden: {
                    scale: 0,
                    filter: "blur(4px)",
                  },
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
                key={theme}
                transition={{ duration: 0.3, type: "spring", bounce: 0.5 }}
                className="block"
              >
                {theme === "dark" ? <IoSunnyOutline /> : <IoMoonOutline />}
              </motion.span>
            </AnimatePresence>
          </div>
        </button>
      ) : null}
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </div>
  );
});

export const useTheme = () => {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw Error("It should be wrapped within the <ComponentWrapper> component");
  }

  return theme;
};

export default ComponentWrapper;
