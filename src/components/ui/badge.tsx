import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "primary" | "warm" | "outline";
};

const toneClasses = {
  neutral: "bg-ink/5 text-ink-soft",
  primary: "bg-primary-soft text-primary-deep",
  warm: "bg-warm-soft text-[#7a520f]",
  outline: "border border-line/80 bg-transparent text-muted",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
