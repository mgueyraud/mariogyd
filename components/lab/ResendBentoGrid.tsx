"use client";
import * as Select from "@radix-ui/react-select";
import ComponentWrapper from "../custom/ComponentWrapper";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";

type Status = "bounced" | "delivered" | "complained";

export default function ResendBentoGrid() {
  const [statusTest, setStatusTest] = useState<Status>("delivered");
  const [responseItems, setResponseItems] = useState([1, 2, 3, 4]);

  return (
    <ComponentWrapper>
      <div className="selection:bg-[#00fff61d] selection:text-[#67ffded2] flex flex-col items-center">
        <Select.Root
          value={statusTest}
          onValueChange={(v) => setStatusTest(v as Status)}
        >
          <div className="border border-[#ddf3ff2f] rounded-lg overflow-hidden">
            <div className="bg-gradient-to-b from-[rgba(255,255,255,0.12)] to-black px-2 pt-1 pb-1.5 w-[25.625rem] flex justify-between">
              <Select.Trigger className="flex gap-2 items-center focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ddf3ff2f]">
                <StatusBadge type={statusTest} />
                <Select.Value asChild>
                  <span className="text-sm">{statusTest}@resend.com</span>
                </Select.Value>
                <Select.Icon>
                  <MdOutlineKeyboardArrowDown width={24} height={24} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black rounded-md p-2 border border-[#ddf3ff2f]"
                  >
                    <Select.Viewport>
                      <Select.Item
                        value="delivered"
                        className="flex relative pl-12 gap-2 py-2 pr-10 outline-none rounded-md focus-within:bg-[rgba(235,236,237,.1)] hover:bg-[rgba(235,236,237,.1)]"
                      >
                        <Select.ItemIndicator className="absolute top-1/2 -translate-y-1/2 left-4">
                          <IoMdCheckmark />
                        </Select.ItemIndicator>
                        <StatusBadge type="delivered" />
                        <Select.ItemText className="text-sm">
                          delivered@resend.com
                        </Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="bounced"
                        className="flex relative pl-12 gap-2 py-2 pr-10 outline-none rounded-md focus-within:bg-[rgba(235,236,237,.1)] hover:bg-[rgba(235,236,237,.1)]"
                      >
                        <Select.ItemIndicator className="absolute top-1/2 -translate-y-1/2 left-4">
                          <IoMdCheckmark />
                        </Select.ItemIndicator>
                        <StatusBadge type="bounced" />
                        <Select.ItemText className="text-sm">
                          bounced@resend.com
                        </Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="complained"
                        className="flex relative pl-12 gap-2 py-2 pr-10 outline-none rounded-md focus-within:bg-[rgba(235,236,237,.1)] hover:bg-[rgba(235,236,237,.1)]"
                      >
                        <Select.ItemIndicator className="absolute top-1/2 -translate-y-1/2 left-4">
                          <IoMdCheckmark />
                        </Select.ItemIndicator>
                        <StatusBadge type="complained" />
                        <Select.ItemText className="text-sm">
                          complained@resend.com
                        </Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </motion.div>
                </Select.Content>
              </Select.Portal>
              <motion.button
                initial={
                  {
                    "--angle": "0deg",
                    "--color": "#FFFFFFFF",
                    transition: { duration: 0 },
                  } as any
                }
                whileHover={
                  {
                    "--angle": "360deg",
                    "--color": "#00000000",
                    transition: { duration: 1.5 },
                  } as any
                }
                aria-label="Send test email"
                className="btn-resend-grid text-sm flex gap-2 px-3 py-1 items-center hover:scale-105 active:scale-95 border border-[#ddf3ff2f] rounded-full transition"
                onClick={() =>
                  setResponseItems((arr) => [...arr, arr[arr.length - 1] + 1])
                }
              >
                <svg
                  fill="none"
                  height="12"
                  width="14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.72 9.2 9.69 4.357V1h.144a.5.5 0 1 0 0-1.001H4.167a.5.5 0 1 0 0 1.001h.143v3.356L1.28 9.2a1.8 1.8 0 0 0-.05 1.85c.33.596.935.951 1.62.951h8.3c.685 0 1.29-.355 1.62-.95a1.801 1.801 0 0 0-.05-1.851ZM8.69 1v3.5a.5.5 0 0 0 .075.265L9.537 6H4.463l.772-1.234a.5.5 0 0 0 .076-.266V1.001H8.69Zm3.204 9.564a.838.838 0 0 1-.744.435h-8.3a.838.838 0 0 1-.744-.435.812.812 0 0 1 .023-.834L3.837 7h6.327l1.708 2.73c.16.257.17.569.022.834Z"
                    fill="#fff"
                  ></path>
                </svg>
                <span>Send</span>
              </motion.button>
            </div>
          </div>
        </Select.Root>
        <div className="mt-12 h-[7.5em] overflow-hidden relative">
          <AnimatePresence initial={false}>
            {[...responseItems].reverse().map((item) => (
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                layout
                className="mb-2 flex gap-4 text-[#f1f7ffb5] text-sm"
                key={item}
              >
                <pre>HTTP 200:</pre>
                <pre className="truncate">
                  {`{ "id": `}
                  <span className="text-[#e8f1ff79]">
                    {`"7f9d5394-e576-4220-9279-cfba31cd762a"`}
                  </span>
                  {`}`}
                </pre>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="bg-gradient-to-b from-transparent to-black absolute inset-0" />
        </div>
      </div>
    </ComponentWrapper>
  );
}

function StatusBadge({ type }: { type: Status }) {
  return (
    <span
      className={cn(
        "h-7 px-2 grid place-items-center text-xs capitalize rounded-md",
        {
          "bg-[#00ff9f1d] text-[#3dd68c]": type === "delivered",
          "bg-[#ff003b28] text-[#ff8a88]": type === "bounced",
          "bg-[#ff93001e] text-[#ffca16]": type === "complained",
        }
      )}
    >
      {type}
    </span>
  );
}
