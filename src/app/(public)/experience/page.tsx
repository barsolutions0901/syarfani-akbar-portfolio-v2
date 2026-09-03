import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { Reveal } from "@/components/site/reveal";
import { getPublishedExperience } from "@/lib/queries";
import { formatDateRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience and roles of Syarfani Akbar across IT infrastructure and software.",
};

export default async function ExperiencePage() {
  const experience = await getPublishedExperience();

  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="A working history, in place."
        intro="An editorial look at the roles and environments I have contributed to."
      />

      <Container className="pb-24 pt-8">
        {experience.length === 0 ? (
          <EmptyState title="No experience entries yet">
            Experience will appear here once it is added and published.
          </EmptyState>
        ) : (
          <ol className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-line/80 sm:left-5" aria-hidden />
            <div className="grid gap-8">
              {experience.map((exp, i) => (
                <li key={exp.id} className="relative pl-12 sm:pl-16">
                  <Reveal delay={i * 50}>
                    <span
                      aria-hidden
                      className="absolute left-4 top-2 -translate-x-1/2 size-3 rounded-full border-2 border-primary bg-paper shadow-sm sm:left-5"
                    />
                    <article className="rounded-3xl border border-line/70 bg-surface p-7 transition-colors hover:border-primary/30 sm:p-8">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                        <h2 className="font-display text-3xl tracking-tight">{exp.title}</h2>
                        <span className="tech-label text-muted">
                          {formatDateRange(exp.startDate, exp.current ? undefined : exp.endDate)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-primary-deep">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </p>
                      {exp.description && (
                        <p className="mt-4 whitespace-pre-wrap text-[1.02rem] leading-relaxed text-ink-soft/90">
                          {exp.description}
                        </p>
                      )}
                    </article>
                  </Reveal>
                </li>
              ))}
            </div>
          </ol>
        )}
      </Container>
    </>
  );
}
