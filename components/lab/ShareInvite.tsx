"use client";
import ComponentWrapper from "../custom/ComponentWrapper";
import { TbWorld } from "react-icons/tb";
import { MdOutlineContentCopy } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { BsFillSendArrowDownFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AiOutlineUserAdd } from "react-icons/ai";
import { MdClose } from "react-icons/md";

export default function ShareInvite() {
  const [check, setCheck] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const timerCopyRef = useRef<NodeJS.Timeout>();

  const handleCopy = () => {
    if (timerCopyRef.current) clearInterval(timerCopyRef.current);
    navigator.clipboard.writeText("https://mariogyd.com");
    setCopied(true);

    timerCopyRef.current = setInterval(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <ComponentWrapper>
      <div className="rounded-lg border border-gray-400 bg-white text-black p-4 pb-0">
        <p className="text-xl font-medium">Share</p>
        <div className="rounded-md bg-[#F4F4FB] p-2 flex mt-3 gap-2 items-center">
          <div className="p-1 rounded-lg bg-white shadow-md">
            <TbWorld className="size-8 text-[#828384]" />
          </div>
          <div>
            <p className="text-sm font-medium">Anyone</p>
            <p className="mt-0 text-xs text-[#89888E]">
              Everyone with link can access
            </p>
          </div>
          <Switch
            className="ml-4"
            checked={check}
            onCheckedChange={(val) => setCheck(val)}
          />
        </div>
        <div className="flex mt-2 justify-between text-[#949597] mb-4">
          <p className="text-xs">https://mariogyd.com</p>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.button
              key={"btn-" + copied}
              onClick={handleCopy}
              initial={{ opacity: 0.5, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
            >
              {copied ? <FaCheck /> : <MdOutlineContentCopy />}
            </motion.button>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {!check ? (
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: "auto",
              }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <p className="font-medium text-sm text-[#626366]">Invite</p>
              <div className="relative mt-2">
                <AiOutlineUserAdd className="absolute top-1/2 left-3 -translate-y-1/2 text-[#868786]" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    (e.target as HTMLFormElement).reset();
                    setShowTag(true);
                  }}
                >
                  <input
                    disabled={showTag}
                    name="email"
                    className="shadow-md border border-[#EEECEC] rounded-md h-9 pl-8 pr-20 text-sm w-full"
                  />
                </form>
                <AnimatePresence initial={false}>
                  {showTag && !showInvite ? (
                    <motion.div
                      layoutId="pill"
                      initial={{
                        transform: "translate(10px, -50%)",
                        opacity: 0,
                      }}
                      animate={{ transform: "translate(0, -50%)", opacity: 1 }}
                      exit={{ transform: "translate(10px, -50%)", opacity: 0 }}
                      className="p-1 rounded-full absolute top-1/2 left-8 flex items-center text-[#908E91] border border-[#E8E8E9] shadow-md -translate-y-1/2"
                    >
                      <motion.img
                        layoutId="avatarImage"
                        src="/images/avatar.jpeg"
                        width={20}
                        height={20}
                        alt="Avatar"
                        className="rounded-full object-cover"
                      />
                      <div>
                        <motion.p layoutId="name" className="text-xs ml-1">
                          Mario
                        </motion.p>
                        <motion.p
                          layoutId="email"
                          className="text-xs text-[#89888E]"
                        ></motion.p>
                      </div>
                      <motion.button
                        layoutId="remove"
                        onClick={() => setShowTag(false)}
                        className="ml-1"
                      >
                        <MdClose className="size-3" />
                      </motion.button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <Button
                  className="absolute top-1/2 right-1 -translate-y-1/2 text-xs h-7 px-3"
                  disabled={!showTag}
                  onClick={() => setShowInvite(true)}
                >
                  <BsFillSendArrowDownFill />
                  <span className="ml-2">Invite</span>
                </Button>
              </div>
              &nbsp;
              <AnimatePresence>
                {showInvite ? (
                  <MotionConfig transition={{ duration: 0.2 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: "auto",
                        transition: { delay: 0.04, duration: 0.16 },
                      }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        layoutId="pill"
                        className="shadow-md border border-[#E8E8E9] w-full rounded-lg p-2 flex items-center gap-2"
                      >
                        <motion.img
                          layoutId="avatarImage"
                          src="/images/avatar.jpeg"
                          width={40}
                          height={40}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                        <div>
                          <motion.p
                            layoutId="name"
                            className="font-medium text-sm"
                          >
                            Mario
                          </motion.p>
                          <motion.p
                            layoutId="email"
                            className="text-xs text-[#89888E]"
                          >
                            mario@mariogyd.com
                          </motion.p>
                        </div>
                        <motion.button
                          onClick={() => {
                            setShowInvite(false);
                            setShowTag(false);
                          }}
                          layoutId="remove"
                          className="ml-auto mr-2"
                        >
                          <MdClose className="size-5" />
                        </motion.button>
                      </motion.div>
                      &nbsp;
                    </motion.div>
                  </MotionConfig>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ComponentWrapper>
  );
}
