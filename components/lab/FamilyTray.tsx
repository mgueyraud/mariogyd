"use client";
import { useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { LuLock, LuAlertTriangle, LuNewspaper } from "react-icons/lu";
import useMeasure from "react-use-measure";
import { IoAlertCircleOutline } from "react-icons/io5";
import { PiEyeBold } from "react-icons/pi";
import { TbFaceId } from "react-icons/tb";
import { RxCircleBackslash } from "react-icons/rx";
import { GoShieldCheck } from "react-icons/go";
import { BsCardText } from "react-icons/bs";

type Option = null | "private-key" | "recovery-phrase" | "delete-wallet";

export default function FamilyTray() {
  const [openDialog, setOpenDialog] = useState(false);
  const [option, setOption] = useState<Option>(null);
  const [elementRef, bounds] = useMeasure();

  const onClose = () => {
    setOpenDialog(false);
    setOption(null);
  };

  return (
    <ComponentWrapper>
      <>
        <Button onClick={() => setOpenDialog((d) => !d)}>Open dialog</Button>
        <AnimatePresence>
          {openDialog ? (
            <>
              <motion.div
                className="fixed inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
              />
              <motion.div
                initial={{ transform: "translateY(calc(100% + 1rem))" }}
                animate={{ transform: "translateY(0)" }}
                exit={{ transform: "translateY(calc(100% + 1rem))" }}
                transition={{ duration: 0.2 }}
                className="bg-white fixed inset-x-4 bottom-4 mx-auto max-w-[361px] text-black rounded-[2.25rem]"
              >
                <motion.div
                  animate={{ height: bounds.height }}
                  className="overflow-hidden relative"
                >
                  <div ref={elementRef}>
                    <button
                      onClick={() => onClose?.()}
                      className="size-8 rounded-full bg-[#F7F8F9] grid place-items-center absolute top-6 right-6"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.4854 1.99998L2.00007 10.4853"
                          stroke="#999999"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M10.4854 10.4844L2.00007 1.99908"
                          stroke="#999999"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                    </button>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {!option ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu onClickOption={(opt) => setOption(opt)} />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {option === "private-key" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PrivateKey onClickOption={(opt) => setOption(opt)} />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout">
                      {option === "delete-wallet" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <DeleteWallet
                            onClickOption={(opt) => setOption(opt)}
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout">
                      {option === "recovery-phrase" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RecoveryPhrase
                            onClickOption={(opt) => setOption(opt)}
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </>
    </ComponentWrapper>
  );
}

const Menu = ({
  onClickOption,
}: {
  onClickOption: (option: Option) => void;
}) => {
  return (
    <div className="px-6 pb-6 pt-2.5">
      <div className="flex h-[4.5rem] items-center border-b border-[#F7F7F7] mb-4">
        <h2 className="font-medium text-[1.1875rem]">Options</h2>
      </div>
      <button
        className="h-12 px-4 gap-4 flex items-center bg-[#F7F8F9] w-full rounded-2xl focus:scale-95 transition"
        onClick={() => onClickOption("private-key")}
      >
        <LuLock className="text-[#8F8F8F] size-5" />
        <span className="font-medium">View private key</span>
      </button>
      <button
        className="h-12 px-4 gap-4 flex items-center bg-[#F7F8F9] w-full rounded-2xl focus:scale-95 transition my-3"
        onClick={() => onClickOption("recovery-phrase")}
      >
        <LuNewspaper className="text-[#8F8F8F] size-5" />
        <span className="font-medium">View Recovery Phrase</span>
      </button>
      <button
        className="h-12 px-4 gap-4 flex items-center bg-[#FFF0F0] text-[#FF3F40] w-full rounded-2xl focus:scale-95 transition mt-3"
        onClick={() => onClickOption("delete-wallet")}
      >
        <LuAlertTriangle className="size-5" />
        <span className="font-medium">Remove Wallet</span>
      </button>
    </div>
  );
};

const DeleteWallet = ({
  onClickOption,
}: {
  onClickOption: (option: Option) => void;
}) => {
  return (
    <div className="px-6 pb-6 pt-2.5">
      <div className="mb-4 mt-5">
        <IoAlertCircleOutline className="size-12 text-[#FF3F3F]" />
      </div>
      <p className="mt-2.5 text-[22px] font-medium ">Are you sure?</p>
      <p className="mt-3 font-medium text-[#999999]">
        You haven’t backed up your wallet yet. If you remove it, you could lose
        access forever. We suggest tapping and backing up your wallet first with
        a valid recovery method.
      </p>
      <div className="mt-7 flex items-center justify-between gap-4">
        <button
          className="h-12 w-full rounded-full text-xl bg-[#F0F2F4] text-black font-semibold focus:scale-95 transition"
          onClick={() => onClickOption(null)}
        >
          Cancel
        </button>
        <button
          className="h-12 w-full rounded-full text-xl bg-[#FF3F40] text-white font-semibold focus:scale-95 transition"
          onClick={() => onClickOption(null)}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const PrivateKey = ({
  onClickOption,
}: {
  onClickOption: (option: Option) => void;
}) => {
  return (
    <div className="px-6 pb-6 pt-2.5">
      <div className="mb-4 mt-5">
        <PiEyeBold className="size-12 text-[#999999]" />
      </div>
      <p className="mt-2.5 text-[22px] font-medium ">Private Key</p>
      <p className="mt-3 font-medium text-[#999999]">
        Your Private Key is the key used to back up your wallet. Keep it secret
        and secure at all times.
      </p>
      <hr className="my-6 border-[#F5F5F5]" />
      <ul className="space-y-4">
        <li className="flex items-center gap-3 text-[#999999] font-medium">
          <GoShieldCheck className="size-6" />
          Keep your private key safe
        </li>
        <li className="flex items-center gap-3 text-[#999999] font-medium">
          <BsCardText className="size-6" />
          Don’t share it with anyone else
        </li>
        <li className="flex items-center gap-3 text-[#999999] font-medium">
          <RxCircleBackslash className="size-6" />
          If you lose it, we can’t recover it
        </li>
      </ul>
      <div className="mt-7 flex items-center justify-between gap-4">
        <button
          className="h-12 w-full rounded-full text-xl bg-[#F0F2F4] text-black font-semibold focus:scale-95 transition"
          onClick={() => onClickOption(null)}
        >
          Cancel
        </button>
        <button
          className="h-12 flex gap-3 items-center justify-center w-full rounded-full text-xl bg-[#4DAFFF] text-white font-semibold focus:scale-95 transition"
          onClick={() => onClickOption(null)}
        >
          <TbFaceId className="size-5" />
          Reveal
        </button>
      </div>
    </div>
  );
};

const RecoveryPhrase = ({
  onClickOption,
}: {
  onClickOption: (option: Option) => void;
}) => {
  return (
    <div className="px-6 pb-6 pt-2.5">
      <div className="mb-4 mt-5">
        <PiEyeBold className="size-12 text-[#999999]" />
      </div>
      <p className="mt-2.5 text-[22px] font-medium ">Secret Recovery Phrase</p>
      <p className="mt-3 font-medium text-[#999999]">
        Your Secret Recovery Phrase is the key used to back up your wallet. Keep
        it secret at all times.
      </p>
      <hr className="my-6 border-[#F5F5F5]" />
      <ul className="space-y-4">
        <li className="flex items-center gap-3 text-[#999999] font-medium">
          <GoShieldCheck className="size-6" />
          Keep your Secret Phrase safe
        </li>
        <li className="flex items-center gap-3 text-[#999999] font-medium">
          <BsCardText className="size-6" />
          Don’t share it with anyone else
        </li>
        <li className="flex items-center gap-3 text-[#999999] font-medium">
          <RxCircleBackslash className="size-6" />
          If you lose it, we can’t recover it
        </li>
      </ul>
      <div className="mt-7 flex items-center justify-between gap-4">
        <button
          className="h-12 w-full rounded-full text-xl bg-[#F0F2F4] text-black font-semibold focus:scale-95 transition"
          onClick={() => onClickOption(null)}
        >
          Cancel
        </button>
        <button
          className="h-12 flex gap-3 items-center justify-center w-full rounded-full text-xl bg-[#4DAFFF] text-white font-semibold focus:scale-95 transition"
          onClick={() => onClickOption(null)}
        >
          <TbFaceId className="size-5" />
          Reveal
        </button>
      </div>
    </div>
  );
};
