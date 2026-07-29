import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The two link treatments used across the site. Exported for the handful of
 * places that need the classes on something other than a link.
 * Size and layout stay at the call site — these only own the treatment.
 */
export const linkStyles = {
  /** Grey, colours in on hover. Secondary and navigational links. */
  muted: "text-subtle no-underline transition-colors hoverable:text-ink",
  /** Hairline underline that darkens on hover. Body and title links. */
  underline:
    "underline decoration-line-strong underline-offset-[3px] transition-colors hoverable:decoration-ink",
} as const;

/**
 * Grows a standalone link or button to a 44px-tall touch target without
 * touching layout — the pseudo-element does the catching, so the text keeps its
 * own 13-19px line box and no margin needs compensating.
 *
 * Only for controls that stand on their own (nav items, "see all", pagination).
 * Links inside a sentence inherit the line height around them and are exempt.
 */
export const tapTarget =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']";

type Props = ComponentProps<typeof Link> & {
  variant?: keyof typeof linkStyles;
};

export default function TextLink({
  variant = "muted",
  className,
  ...props
}: Props) {
  return <Link {...props} className={cn(linkStyles[variant], className)} />;
}
