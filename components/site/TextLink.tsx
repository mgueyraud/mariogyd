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
  muted: "text-subtle no-underline transition-colors hover:text-ink",
  /** Hairline underline that darkens on hover. Body and title links. */
  underline:
    "underline decoration-line-strong underline-offset-[3px] transition-colors hover:decoration-ink",
} as const;

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
