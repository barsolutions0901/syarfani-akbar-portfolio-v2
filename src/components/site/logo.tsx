import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.author} — back to home`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-full bg-primary text-[0.8rem] font-semibold tracking-tight text-surface shadow-sm transition-all duration-300 group-hover:-translate-y-px group-hover:bg-primary-deep"
      >
        {siteConfig.shortName}
      </span>
      <span className="text-[0.95rem] font-bold tracking-tight text-ink">
        {siteConfig.author}
      </span>
    </Link>
  );
}
