import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "default",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "default" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-6",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn(align === "center" && "mx-auto flex max-w-2xl flex-col items-center")}>
        <p className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-warm" aria-hidden />
          <span className="text-[0.8rem] font-bold tracking-[0.02em] text-primary">
            {eyebrow}
          </span>
        </p>
        <h2
          className={cn(
            "mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl",
            align === "center" && "text-balance",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft/80",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
