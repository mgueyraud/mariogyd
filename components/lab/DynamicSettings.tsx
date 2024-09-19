"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import * as Slider from "@radix-ui/react-slider";

export default function DynamicSettings() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("dimensions");

  //Accesibility enhancements
  useEffect(() => {
    if (!open) {
      setTab("dimensions");
    }
  }, [open]);

  return (
    <ComponentWrapper>
      <MotionConfig
        transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
      >
        <div>
          <AnimatePresence initial={false} mode="popLayout">
            {!open ? (
              <div>
                <motion.button
                  layoutId="dialog-button"
                  className="relative text-sm text-white bg-[#161716] gap-2 w-36 h-14 border border-[#ffffff08] outline-none focus-visible:outline-1 focus-visible:outline-[#FDFF79]"
                  onClick={() => setOpen(true)}
                  style={{ borderRadius: 14 }}
                >
                  <motion.span
                    layout="position"
                    className="absolute left-5 top-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                  >
                    Add style
                  </motion.span>
                  <motion.div
                    className="absolute top-2 right-3 p-2"
                    layout="position"
                    layoutId="close-open-icon"
                  >
                    <motion.div
                      initial={{ rotate: "0deg" }}
                      animate={{ rotate: "45deg" }}
                    >
                      <OpenAndCloseIcon />
                    </motion.div>
                  </motion.div>
                </motion.button>
              </div>
            ) : null}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {open ? (
              <motion.div
                layoutId="dialog-button"
                className="relative rounded-[14px] text-sm text-white bg-[#161716] p-2 border border-[#ffffff08] w-96 overflow-hidden"
                style={{ borderRadius: 14 }}
              >
                <motion.button
                  className="absolute z-10 top-2 right-2 p-2 outline-none focus-visible:outline-1 focus-visible:outline-[#FDFF79] focus-visible:outline-offset-4"
                  layoutId="close-open-icon"
                  onClick={() => setOpen(false)}
                >
                  <motion.div
                    initial={{ rotate: "45deg" }}
                    animate={{ rotate: "0deg" }}
                  >
                    <OpenAndCloseIcon />
                  </motion.div>
                </motion.button>

                {/* Tabs */}
                <Tabs.Root value={tab} onValueChange={(t) => setTab(t)}>
                  <Tabs.List>
                    <motion.div
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: 0.5,
                          type: "spring",
                          bounce: 0.25,
                        },
                      }}
                    >
                      <Tabs.Trigger
                        value="dimensions"
                        className="transition duration-500 text-[#929292] data-[state=active]:text-white px-2 py-[6px] relative outline-none focus-visible:outline-1 focus-visible:outline-[#FDFF79] focus-visible:outline-offset-4"
                      >
                        <AnimatePresence mode="popLayout">
                          {tab === "dimensions" ? (
                            <motion.div
                              layoutId="bg-tab"
                              className="absolute inset-0 rounded-lg bg-[#ffffff08]"
                              exit={{ opacity: 0, transition: { duration: 0 } }}
                            />
                          ) : null}
                        </AnimatePresence>
                        Dimensions
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="aspect-ratio"
                        className="transition duration-500 text-[#929292] data-[state=active]:text-white px-2 py-[6px] relative outline-none focus-visible:outline-1 focus-visible:outline-[#FDFF79] focus-visible:outline-offset-4"
                      >
                        <AnimatePresence mode="popLayout">
                          {tab === "aspect-ratio" ? (
                            <motion.div
                              layoutId="bg-tab"
                              className="absolute inset-0 rounded-lg bg-[#ffffff08]"
                              exit={{ opacity: 0, transition: { duration: 0 } }}
                            />
                          ) : null}
                        </AnimatePresence>
                        Aspect Ratio
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="prompt"
                        className="transition duration-500 text-[#929292] data-[state=active]:text-white px-2 py-[6px] relative outline-none focus-visible:outline-1 focus-visible:outline-[#FDFF79] focus-visible:outline-offset-4"
                      >
                        <AnimatePresence mode="popLayout">
                          {tab === "prompt" ? (
                            <motion.div
                              layoutId="bg-tab"
                              className="absolute inset-0 rounded-lg bg-[#ffffff08]"
                              exit={{ opacity: 0, transition: { duration: 0 } }}
                            />
                          ) : null}
                        </AnimatePresence>
                        Prompt
                      </Tabs.Trigger>
                    </motion.div>
                  </Tabs.List>
                  <motion.div
                    key={tab}
                    layout="position"
                    className="px-3 pt-3 pb-1 overflow-hidden"
                    initial={{ filter: "blur(4px)", opacity: 0 }}
                    exit={{ filter: "blur(4px)", opacity: 0 }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      transition: { duration: 1, type: "spring", bounce: 0 },
                    }}
                  >
                    <Tabs.Content value="dimensions">
                      <DimensionsTab />
                    </Tabs.Content>
                    <Tabs.Content value="aspect-ratio">
                      <AspectRatioTab />
                    </Tabs.Content>
                    <Tabs.Content value="prompt">
                      <PromptTab />
                    </Tabs.Content>
                  </motion.div>
                </Tabs.Root>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </MotionConfig>
    </ComponentWrapper>
  );
}

function OpenAndCloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.744 2.744a.833.833 0 011.179 0L8 6.821l4.077-4.077a.833.833 0 111.179 1.179L9.179 8l4.077 4.077a.833.833 0 01-1.179 1.179L8 9.179l-4.077 4.077a.833.833 0 01-1.179-1.179L6.821 8 2.744 3.923a.833.833 0 010-1.179z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

function CustomSlider({ label }: { label: string }) {
  const [value, setValue] = useState([50]);

  return (
    <fieldset className="flex justify-between group">
      <label className="text-[#929292] capitalize group-hover:text-white">
        {label}
      </label>
      <div className="flex w-3/5 gap-2">
        <div className="h-7 w-12 bg-white/5 text-sm rounded-md grid place-items-center">
          {value}
        </div>
        <Slider.Root
          value={value}
          onValueChange={(v) => setValue(v)}
          defaultValue={[50]}
          max={100}
          step={1}
          className="relative w-full block"
        >
          <Slider.Track className="block relative w-full h-7 rounded-md bg-white/5">
            <Slider.Range className="absolute bg-white/10 h-full rounded-md group-hover:bg-white/20" />
          </Slider.Track>
          <Slider.Thumb
            aria-label={label}
            className="block -translate-y-full h-7 w-3 rounded-[3px] bg-[#dcdcdc] cursor-pointer"
          />
        </Slider.Root>
      </div>
    </fieldset>
  );
}

function DimensionsTab() {
  return (
    <form className="flex flex-col gap-3">
      <CustomSlider label="vertical" />
      <CustomSlider label="horizontal" />
      <CustomSlider label="upscale" />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="h-[6px] w-[6px] rounded-full bg-[#FDFF79]" />
          <p className="text-[12px] text-[#8B8B8B]">Changes</p>
        </div>
        <button
          className="self-end rounded-lg bg-[#FDFF79] px-2 py-[6px] font-medium text-[#141612] transition-colors duration-200 hover:bg-[#EDF067]"
          onClick={(e) => e.preventDefault()}
        >
          Apply changes
        </button>
      </div>
    </form>
  );
}

function AspectRatioTab() {
  return (
    <div>
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        <label className="cursor-pointer flex gap-[6px] items-center px-3 py-[6px] text-[#929292] text-sm rounded-md has-[:checked]:text-[#FDFF79] has-[:checked]:bg-[#191c0e] hover:text-[#FDFF79]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3.833c0-.46.373-.833.833-.833H15.5c.46 0 .833.373.833.833V15.5c0 .46-.373.833-.833.833H3.833A.833.833 0 013 15.5V3.833z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>1:1</span>
          <input
            type="radio"
            name="aspect-ratio"
            value="1:1"
            className="hidden"
            defaultChecked
          />
        </label>
        <label className="cursor-pointer flex gap-[6px] items-center px-3 py-[6px] text-[#929292] text-sm rounded-md has-[:checked]:text-[#FDFF79] has-[:checked]:bg-[#191c0e] hover:text-[#FDFF79]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.664 5.833c0-.46.373-.833.833-.833h15c.46 0 .834.373.834.833v8.334c0 .46-.373.833-.834.833h-15a.833.833 0 01-.833-.833V5.833z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>16:9</span>
          <input
            type="radio"
            name="aspect-ratio"
            value="16:9"
            className="hidden"
          />
        </label>
        <label className="cursor-pointer flex gap-[6px] items-center px-3 py-[6px] text-[#929292] text-sm rounded-md has-[:checked]:text-[#FDFF79] has-[:checked]:bg-[#191c0e] hover:text-[#FDFF79]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M.836 6.667c0-.46.373-.833.833-.833h16.667c.46 0 .833.373.833.833v6.667c0 .46-.373.833-.833.833H1.669a.833.833 0 01-.833-.833V6.667z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>21:9</span>
          <input
            type="radio"
            name="aspect-ratio"
            value="21:9"
            className="hidden"
          />
        </label>
        <label className="cursor-pointer flex gap-[6px] items-center px-3 py-[6px] text-[#929292] text-sm rounded-md has-[:checked]:text-[#FDFF79] has-[:checked]:bg-[#191c0e] hover:text-[#FDFF79]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.164 3.333c0-.46.373-.833.833-.833h10c.46 0 .834.373.834.833v13.334c0 .46-.373.833-.834.833h-10a.833.833 0 01-.833-.833V3.333z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>3:4</span>
          <input
            type="radio"
            name="aspect-ratio"
            value="3:4"
            className="hidden"
          />
        </label>
        <label className="cursor-pointer flex gap-[6px] items-center px-3 py-[6px] text-[#929292] text-sm rounded-md has-[:checked]:text-[#FDFF79] has-[:checked]:bg-[#191c0e] hover:text-[#FDFF79]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 5c0-.46.373-.833.833-.833h13.334c.46 0 .833.373.833.833v10c0 .46-.373.833-.833.833H3.333A.833.833 0 012.5 15V5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>4:3</span>
          <input
            type="radio"
            name="aspect-ratio"
            value="4:3"
            className="hidden"
          />
        </label>
        <label className="cursor-pointer flex gap-[6px] items-center px-3 py-[6px] text-[#929292] text-sm rounded-md has-[:checked]:text-[#FDFF79] has-[:checked]:bg-[#191c0e] hover:text-[#FDFF79]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.813 10.19l.944 3.905 2.104-3.423 4.006.31-2.605-3.06 1.532-3.714-3.714 1.533L9.02 3.136l.31 4.006-3.423 2.104 3.905.943zm0 0l-6.477 6.477"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>Custom</span>
          <input
            type="radio"
            name="aspect-ratio"
            value="Custom"
            className="hidden"
          />
        </label>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="h-[6px] w-[6px] rounded-full bg-[#FDFF79]" />
          <p className="text-[12px] text-[#8B8B8B]">Changes</p>
        </div>
        <button
          className="self-end rounded-lg bg-[#FDFF79] px-2 py-[6px] font-medium text-[#141612] transition-colors duration-200 hover:bg-[#EDF067]"
          onClick={(e) => e.preventDefault()}
        >
          Apply changes
        </button>
      </div>
    </div>
  );
}

function PromptTab() {
  return (
    <form>
      <textarea
        placeholder="Add a new prompt"
        autoFocus
        className="h-[120px] w-full resize-none rounded-[6px] bg-transparent px-2 py-[6px] text-sm text-white placeholder:text-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDFF79]"
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="h-[6px] w-[6px] rounded-full bg-[#FDFF79]" />
          <p className="text-[12px] text-[#8B8B8B]">Changes</p>
        </div>
        <button
          className="self-end rounded-lg bg-[#FDFF79] px-2 py-[6px] font-medium text-[#141612] transition-colors duration-200 hover:bg-[#EDF067]"
          onClick={(e) => e.preventDefault()}
        >
          Apply changes
        </button>
      </div>
    </form>
  );
}
