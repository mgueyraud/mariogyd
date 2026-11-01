"use client";
import { LuMoon, LuSun } from "react-icons/lu";

export type Theme = "dark" | "light";

type ThemeSwitchProps = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export default function ThemeSwitch({ theme, onChange }: ThemeSwitchProps) {
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => onChange(dark ? "light" : "dark")}
      className="grid size-8 place-items-center rounded-md hover:bg-(--chrome-hover) active:bg-(--chrome-active)"
    >
      {dark ? <LuMoon size={15} aria-hidden /> : <LuSun size={15} aria-hidden />}
    </button>
  );
}
