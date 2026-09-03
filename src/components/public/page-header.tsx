import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

export function PageHeader({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <Container as="header" className="pb-10 pt-16 sm:pt-24">
      <p className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-warm" aria-hidden />
        <span className="text-[0.8rem] font-bold tracking-[0.02em] text-primary">
          {eyebrow}
        </span>
      </p>
      <div className="mt-4 flex max-w-4xl flex-wrap items-end justify-between gap-6">
        <h1 className="text-balance font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {action}
      </div>
      {intro && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft/85">{intro}</p>
      )}
    </Container>
  );
}
