import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { Reveal } from "@/components/site/reveal";
import { getPublishedSkills } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Technical capabilities and skills of Syarfani Akbar across infrastructure, software, and engineering.",
};

export default async function SkillsPage() {
  const skills = await getPublishedSkills();
  const byCategory = groupByCategory(skills);

  return (
    <>
      <PageHeader
        eyebrow="Skills"
        title="The tools I reach for."
        intro="A breadth of engineering capabilities, organized by the areas I work in most."
      />

      <Container className="pb-24 pt-8">
        {skills.length === 0 ? (
          <EmptyState title="No skills yet">
            Skills will appear here once they are added and published.
          </EmptyState>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(byCategory).map(([category, items], i) => (
              <Reveal key={category} delay={(i % 2) * 60} className={i === 0 ? "md:col-span-2" : ""}>
                <section className="h-full rounded-3xl border border-line/70 bg-surface p-7 sm:p-8">
                  <p className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-warm" aria-hidden />
                    <span className="text-[0.8rem] font-bold text-primary">{category}</span>
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <li
                        key={skill.id}
                        className="rounded-full border border-line/80 bg-paper px-3.5 py-2 text-sm font-medium text-ink-soft"
                      >
                        {skill.name}
                        {skill.level ? (
                          <span className="ml-1.5 text-xs text-muted">{skill.level}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

function groupByCategory(skills: { id: string; name: string; level: string | null; category: string }[]) {
  const map = new Map<string, { id: string; name: string; level: string | null }[]>();
  for (const skill of skills) {
    const list = map.get(skill.category) ?? [];
    list.push({ id: skill.id, name: skill.name, level: skill.level });
    map.set(skill.category, list);
  }
  return Object.fromEntries(map.entries()) as Record<string, { id: string; name: string; level: string | null }[]>;
}
