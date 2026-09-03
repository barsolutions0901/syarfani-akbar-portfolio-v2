import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      {label && (
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      )}
      {children}
      {hint && !error && (
        <span className="text-xs text-muted">{hint}</span>
      )}
      {error && (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}