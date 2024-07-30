"use client";
import { useState } from "react";
import ComponentWrapper from "../custom/ComponentWrapper";
import { FaCircleCheck } from "react-icons/fa6";
import { motion } from "framer-motion";

const Tag = ({
  tagName,
  value,
  handleClick,
  isSelected,
}: {
  tagName: string;
  value: string;
  handleClick: (tag: string) => void;
  isSelected: (tag: string) => boolean;
}) => {
  return (
    <motion.button
      layout
      className="flex gap-1 rounded-xl border items-center p-2 text-xs"
      onClick={() => handleClick(value)}
      animate={{ borderColor: isSelected(value) ? "#4ade80" : "#ffffff" }}
      transition={{ duration: 1, type: "spring", bounce: 0.7 }}
    >
      {isSelected(value) ? (
        <motion.div
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          exit={{
            scale: 0,
          }}
          transition={{ duration: 1, type: "spring", bounce: 0.7 }}
        >
          <FaCircleCheck className="size-3 text-green-400" />
        </motion.div>
      ) : null}
      <motion.span
        layout
        transition={{ duration: 1, type: "spring", bounce: 0.7 }}
        className="font-medium"
      >
        {tagName}
      </motion.span>
    </motion.button>
  );
};

export default function TagsUI() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTags = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((tags) =>
        tags.filter((currentTag) => currentTag !== tag)
      );
    } else {
      setSelectedTags((tags) => [...tags, tag]);
    }
  };

  return (
    <ComponentWrapper>
      <div className="flex gap-2 max-w-[350px] flex-wrap">
        <Tag
          tagName="Personal"
          value="personal"
          handleClick={(tag) => toggleTags(tag)}
          isSelected={(tag) => selectedTags.includes(tag)}
        />
        <Tag
          tagName="Inspiration"
          value="inspiration"
          handleClick={(tag) => toggleTags(tag)}
          isSelected={(tag) => selectedTags.includes(tag)}
        />
        <Tag
          tagName="Ideas"
          value="ideas"
          handleClick={(tag) => toggleTags(tag)}
          isSelected={(tag) => selectedTags.includes(tag)}
        />
        <Tag
          tagName="To-Do"
          value="to-do"
          handleClick={(tag) => toggleTags(tag)}
          isSelected={(tag) => selectedTags.includes(tag)}
        />
        <Tag
          tagName="Meetings"
          value="meetings"
          handleClick={(tag) => toggleTags(tag)}
          isSelected={(tag) => selectedTags.includes(tag)}
        />
        <Tag
          tagName="Study"
          value="study"
          handleClick={(tag) => toggleTags(tag)}
          isSelected={(tag) => selectedTags.includes(tag)}
        />
      </div>
    </ComponentWrapper>
  );
}
