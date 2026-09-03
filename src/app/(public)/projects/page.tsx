import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { ProjectCard } from "@/components/public/project-card";
import { EmptyState } from "@/components/public/empty-state";
import { Reveal } from "@/components/site/reveal";
import { getPublishedProjects } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects and technical work built by Syarfani Akbar — infrastructure, software, and systems.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  const featured = projects.filter((p) => p.isFeatured);
  const rest = projects.filter((p) => !p.isFeatured);

  return (
    <Container className="pb-24 pt-12 sm:pt-16">
      <header className="max-w-3xl pb-12 sm:pb-16">
        <p className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-warm" aria-hidden />
          <span className="text-[0.8rem] font-bold tracking-[0.02em] text-primary">
            Projects
          </span>
        </p>
        <h1 className="mt-4 text-balance font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Selected work
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft/85">
          A curated view of the systems, infrastructure, and products I design
          and build.
        </p>
      </header>

      {projects.length === 0 ? (
        <EmptyState title="No projects published yet">
          Projects will appear here once they are published from the admin
          panel.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={i * 80}>
              <ProjectCard project={project} large />
            </Reveal>
          ))}

          {rest.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((project, i) => (
                <Reveal key={project.id} delay={i * 70}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}

      {projects.length > 0 && (
        <p className="mt-16 border-t border-line/70 pt-8 text-sm text-muted">
          {projects.length} published {projects.length === 1 ? "project" : "projects"}
        </p>
      )}
    </Container>
  );
}
