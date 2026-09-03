import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowUpRight } from "@/components/icons/arrows";
import { ProjectCard } from "@/components/public/project-card";
import { Reveal } from "@/components/site/reveal";
import { getPublishedProjectBySlug } from "@/lib/queries";
import { getPublishedProjects } from "@/lib/queries";
import { formatMonthYear } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) notFound();

  const thumbnail =
    project.images.find((i) => i.isThumbnail)?.url ?? project.images[0]?.url;
  const gallery = project.images.filter((i) => !i.isThumbnail);

  const sections = buildSections(project);
  const meta = buildMeta(project);

  const allProjects = await getPublishedProjects();
  const related = allProjects.filter((p) => p.id !== project.id).slice(0, 3);

  return (
    <Container className="pb-24 pt-12 sm:pt-16">
      <Button variant="ghost" size="sm" href="/projects" className="-ml-3 mb-10">
        ← All projects
      </Button>

      {/* Header */}
      <header className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          {project.category && <Badge tone="primary">{project.category}</Badge>}
          {project.status && <Badge tone="outline">{project.status}</Badge>}
          {project.isFeatured && <Badge tone="warm">Featured</Badge>}
        </div>
        <h1 className="mt-6 text-balance font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          {project.title}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-ink-soft">
          {project.shortDescription}
        </p>

        {project.technologies.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech.id}
                className="rounded-full border border-line/80 bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft"
              >
                {tech.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Metadata rail */}
      {(meta.length > 0 || project.role || project.client) && (
        <dl className="mt-12 max-w-4xl divide-y divide-line/70 border-y border-line/70">
          {meta.map((m) => (
            <div key={m.label} className="grid grid-cols-[10rem_1fr] gap-6 py-4 sm:grid-cols-[12rem_1fr]">
              <dt className="tech-label pt-1 text-muted">{m.label}</dt>
              <dd className="text-[0.98rem] font-medium text-ink">{m.value}</dd>
            </div>
          ))}
          {project.role && (
            <div className="grid grid-cols-[10rem_1fr] gap-6 py-4 sm:grid-cols-[12rem_1fr]">
              <dt className="tech-label pt-1 text-muted">Role</dt>
              <dd className="text-[0.98rem] font-medium text-ink">{project.role}</dd>
            </div>
          )}
          {project.client && (
            <div className="grid grid-cols-[10rem_1fr] gap-6 py-4 sm:grid-cols-[12rem_1fr]">
              <dt className="tech-label pt-1 text-muted">Client</dt>
              <dd className="text-[0.98rem] font-medium text-ink">{project.client}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Hero image */}
      {thumbnail && (
        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-3xl border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={project.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </Reveal>
      )}

      {/* Body + aside */}
      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
        <article className="min-w-0 text-[1.06rem] leading-relaxed text-ink-soft">
          {project.description && (
            <CaseStudySection title="Case study">
              <p className="whitespace-pre-wrap text-xl leading-relaxed text-ink">
                {project.description}
              </p>
            </CaseStudySection>
          )}

          {sections.map((section) => (
            <CaseStudySection key={section.title} title={section.title}>
              <p className="whitespace-pre-wrap leading-[1.8]">{section.content}</p>
            </CaseStudySection>
          ))}

          {gallery.length > 0 && (
            <CaseStudySection title="Gallery">
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.alt ?? `${project.title} screenshot`}
                    className="aspect-video w-full rounded-2xl border border-line object-cover"
                  />
                ))}
              </div>
            </CaseStudySection>
          )}
        </article>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          {sections.length > 0 && (
            <nav
              aria-label="Case study sections"
              className="rounded-2xl border border-line/70 bg-surface p-6"
            >
              <p className="tech-label text-muted">On this page</p>
              <ul className="mt-4 space-y-2.5">
                {sections.map((s) => (
                  <li key={s.title}>
                    <a
                      href={`#${slugify(s.title)}`}
                      className="text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-primary"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {(project.liveUrl || project.githubUrl) && (
            <div className="grid gap-2">
              {project.liveUrl && (
                <Button href={project.liveUrl} className="w-full" target="_blank">
                  Visit live site
                  <ArrowUpRight className="size-4" />
                </Button>
              )}
              {project.githubUrl && (
                <Button href={project.githubUrl} variant="outline" className="w-full" target="_blank">
                  View source
                  <ArrowUpRight className="size-4" />
                </Button>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24 border-t border-line/70 pt-14">
          <div className="mb-10">
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-warm" aria-hidden />
              <span className="text-[0.8rem] font-bold text-primary">More work</span>
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
              Other projects
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function CaseStudySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={slugify(title)}
      className="mt-14 scroll-mt-28 first:mt-0"
    >
      <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">
        {title}
      </h2>
      <div className="mt-4 border-t-2 border-primary/15 pt-5">
        {children}
      </div>
    </section>
  );
}

function buildSections(
  project: {
    overview: string | null;
    features: string | null;
    challenges: string | null;
    solutions: string | null;
    results: string | null;
    architecture: string | null;
  },
) {
  const entries: Array<{ title: string; content: string }> = [
    { title: "Overview", content: project.overview ?? "" },
    { title: "Features", content: project.features ?? "" },
    { title: "Challenges", content: project.challenges ?? "" },
    { title: "Solutions", content: project.solutions ?? "" },
    { title: "Architecture", content: project.architecture ?? "" },
    { title: "Results", content: project.results ?? "" },
  ];
  return entries.filter((e) => e.content.trim().length > 0);
}

function buildMeta(project: {
  status: string | null;
  startDate: Date | null;
  endDate: Date | null;
}): Array<{ label: string; value: string }> {
  const meta: Array<{ label: string; value: string }> = [];
  if (project.status) meta.push({ label: "Status", value: project.status });
  if (project.startDate) {
    const start = formatMonthYear(project.startDate);
    const end = project.endDate ? formatMonthYear(project.endDate) : "Present";
    meta.push({ label: "Timeline", value: `${start} — ${end}` });
  }
  return meta;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
