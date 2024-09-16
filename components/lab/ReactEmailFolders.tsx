"use client";
import React, { useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FILES = [
  "aws-verify-email",
  "job-accepted-magic-link",
  "linear-login-code",
  "notion-magic-link",
  "plaid-verify-identity",
  "raycast-magic-link",
  "slack-confirm",
] as const;

export default function ReactEmailFolders() {
  const [open, setOpen] = useState(true);
  const [selectedFile, setSelectedFile] =
    useState<(typeof FILES)[number]>("notion-magic-link");

  return (
    <ComponentWrapper>
      <div className="w-[239px] h-full pt-24 text-sm">
        <button
          aria-label="Open folder "
          onClick={() => setOpen(!open)}
          className="flex gap-1 items-center text-gray-400 mb-1 hover:text-white transition-colors"
        >
          {open ? <OpenedFolderIcon /> : <ClosedFolderIcon />}
          <span className="font-medium">magic-links</span>
          <motion.div
            initial={{
              rotate: "180deg",
            }}
            animate={{
              rotate: open ? "180deg" : "0deg",
            }}
            transition={{ duration: 0.3, type: "spring", bounce: 0 }}
          >
            <MdOutlineKeyboardArrowDown />
          </motion.div>
        </button>
        <motion.div
          className="relative pl-1 overflow-hidden"
          initial="opened"
          animate={open ? "opened" : "closed"}
          variants={{
            opened: {
              height: "auto",
              opacity: 1,
              transition: {
                staggerChildren: 0.035,
              },
            },
            closed: {
              height: 0,
              opacity: 0,
              transition: {
                when: "beforeChildren",
              },
            },
          }}
        >
          <div className="line absolute left-2.5 w-px h-full bg-slate-600" />
          {FILES.map((file) => (
            <motion.button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={cn(
                "text-gray-400 pl-3 h-8 relative flex w-full transition-colors",
                {
                  "text-cyan-500": selectedFile === file,
                  "hover:text-white": selectedFile !== file,
                }
              )}
              variants={{
                opened: {
                  opacity: 1,
                  x: 0,
                },
                closed: {
                  opacity: 0,
                  x: -10,
                },
              }}
            >
              {selectedFile === file ? (
                <div className="absolute inset-0 rounded-md bg-[rgba(7,205,254,.173)] z-0">
                  <div className="bg-cyan-500 w-px absolute top-1 left-1.5 h-6"></div>
                </div>
              ) : null}
              <div className="flex gap-1 items-center relative h-full">
                <FileIcon />
                <span className="font-medium">{file}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </ComponentWrapper>
  );
}

function ClosedFolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clip-rule="evenodd"
        d="M6.75 4C5.23122 4 4 5.23122 4 6.75V7.75V8V17.25C4 18.7688 5.23122 20 6.75 20H17.25C18.7688 20 20 18.7688 20 17.25V9.75C20 8.23122 18.7688 7 17.25 7H14.0816L13.227 5.43322C12.7451 4.54965 11.819 4 10.8127 4H6.75ZM12.3729 7L11.9101 6.15145L11.91 6.15138C11.6911 5.74989 11.2702 5.5 10.8127 5.5H6.75C6.05964 5.5 5.5 6.05964 5.5 6.75V7H12.3729ZM5.5 17.25V8.5H17.25C17.9404 8.5 18.5 9.05964 18.5 9.75V17.25C18.5 17.9404 17.9404 18.5 17.25 18.5H6.75C6.05964 18.5 5.5 17.9404 5.5 17.25Z"
        fill="currentColor"
        fill-rule="evenodd"
      ></path>
    </svg>
  );
}

function OpenedFolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clip-rule="evenodd"
        d="M6.75 4C5.23122 4 4 5.23122 4 6.75V17.25V17.5C4 17.5933 4.01702 17.6825 4.04812 17.7649C4.28918 19.0376 5.4072 20 6.75 20H17.25C17.9905 20 18.6283 19.7404 19.111 19.2387C19.5681 18.7636 19.836 18.1241 19.9792 17.4279L21.4711 12.206C21.4903 12.139 21.5 12.0697 21.5 12C21.5 10.652 20.5301 9.53047 19.25 9.29534V8.5C19.25 7.5335 18.4665 6.75 17.5 6.75H13.9452L13.227 5.43322C12.7451 4.54965 11.819 4 10.8127 4H6.75ZM17.75 9.25V8.5C17.75 8.36193 17.6381 8.25 17.5 8.25H13.5C13.2255 8.25 12.973 8.10009 12.8416 7.85915L11.9101 6.15145L11.91 6.15138C11.6911 5.74989 11.2702 5.5 10.8127 5.5H6.75C6.05964 5.5 5.5 6.05964 5.5 6.75V13.158L6.79875 9.73401C6.90926 9.44267 7.1884 9.25 7.5 9.25H17.75ZM5.50587 17.372L8.01766 10.75H18.5H18.75C19.4091 10.75 19.949 11.26 19.9966 11.9069L18.5289 17.044C18.5233 17.0634 18.5185 17.0831 18.5146 17.1029C18.4062 17.6448 18.2275 17.9934 18.03 18.1988C17.8513 18.3846 17.6141 18.5 17.25 18.5H6.75C6.10079 18.5 5.56718 18.0051 5.50587 17.372Z"
        fill="currentColor"
        fill-rule="evenodd"
      ></path>
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clip-rule="evenodd"
        d="M7.75 4C6.23122 4 5 5.23122 5 6.75V17.25C5 18.7688 6.23122 20 7.75 20H16.25C17.7688 20 19 18.7688 19 17.25V9C19 8.80109 18.921 8.61032 18.7803 8.46967L14.5303 4.21967C14.3897 4.07902 14.1989 4 14 4H7.75ZM6.5 6.75C6.5 6.05964 7.05964 5.5 7.75 5.5H13V9.25C13 9.66421 13.3358 10 13.75 10H17.5V17.25C17.5 17.9404 16.9404 18.5 16.25 18.5H7.75C7.05964 18.5 6.5 17.9404 6.5 17.25V6.75ZM16.6893 8.5L14.5 6.31066V8.5H16.6893Z"
        fill="currentColor"
        fill-opacity="0.927"
        fill-rule="evenodd"
      ></path>
    </svg>
  );
}
