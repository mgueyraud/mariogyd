import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * Position in the entrance sequence. Each step delays the animation by
   * 120ms — see `.animate-enter` in app/globals.css.
   */
  step: number;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

/**
 * The staggered page-entrance wrapper. Exists so the `--stagger` custom
 * property and its `CSSProperties` cast live in one place instead of being
 * repeated inline on every section of every page.
 */
export default function Reveal({
  step,
  as: Tag = "div",
  className,
  children,
}: Props) {
  return (
    <Tag
      className={cn("animate-enter", className)}
      style={{ "--stagger": step } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
