import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-surface/50 px-6 py-20 text-center",
        className,
      )}
    >
      {icon && (
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          {icon}
        </span>
      )}
      <h2 className="font-display text-2xl tracking-tight text-ink-soft">{title}</h2>
      {children && (
        <p className="max-w-md text-[0.95rem] leading-relaxed text-muted">{children}</p>
      )}
    </div>
  );
}
