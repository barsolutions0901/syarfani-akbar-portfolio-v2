import { ArrowUpRight } from "@/components/icons/arrows";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProjectCard } from "@/components/public/project-card";
import { SectionHeading } from "@/components/public/section-heading";
import { Reveal } from "@/components/site/reveal";
import { getPublicProfile } from "@/lib/queries";
import { getPublishedProjects } from "@/lib/queries";
import { getPublishedExperience } from "@/lib/queries";
import { getPublishedSkills } from "@/lib/queries";
import { getPublishedEducation } from "@/lib/queries";
import { getPublishedSocialLinks } from "@/lib/queries";
import { formatDateRange } from "@/lib/format";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const [profile, projects, experience, skills, education, socialLinks] =
    await Promise.all([
      getPublicProfile(),
      getPublishedProjects(),
      getPublishedExperience(),
      getPublishedSkills(),
      getPublishedEducation(),
      getPublishedSocialLinks(),
    ]);

  const featured = projects.filter((p) => p.isFeatured);
  const otherProjects = projects.filter((p) => !p.isFeatured);

  const displayName = profile?.name?.trim() ? profile.name.trim() : siteConfig.author;
  const displayTitle = profile?.title?.trim() ? profile.title.trim() : siteConfig.tagline;
  const bio = profile?.bio?.trim();

  const latestExperience = experience.slice(0, 3);
  const skillsByCategory = groupSkills(skills);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-line/70">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-primary/[0.05] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-[26rem] rounded-full bg-warm/[0.07] blur-3xl"
        />
        <Container className="relative grid gap-14 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
          <div>
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-warm" aria-hidden />
              <span className="text-[0.82rem] font-bold tracking-[0.02em] text-primary">
                IT Engineer · Developer · Product Builder
              </span>
            </p>

            <h1 className="mt-6 text-balance font-display text-[2.9rem] leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">
              {displayName}
              <span className="mt-2 block font-display italic text-primary">
                {displayTitle}
              </span>
            </h1>

            {bio ? (
              <p className="mt-7 max-w-xl text-pretty text-[1.15rem] leading-relaxed text-ink-soft">
                {bio}
              </p>
            ) : (
              <p className="mt-7 max-w-xl text-pretty text-[1.15rem] leading-relaxed text-ink-soft">
                Building and operating infrastructure, software, and products —
                with a portfolio of projects from concept to implementation.
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/projects" size="lg">
                View projects
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button href="/contact" size="lg" variant="outline">
                Let&apos;s talk
              </Button>
            </div>

            {(profile?.location || profile?.availability) && (
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-3">
                {profile?.location && (
                  <div className="flex items-center gap-2.5">
                    <SvgPin />
                    <dd className="text-sm font-medium text-ink-soft">{profile.location}</dd>
                  </div>
                )}
                {profile?.availability && (
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-warm opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-warm" />
                    </span>
                    <dd className="text-sm font-medium text-primary-deep">
                      {profile.availability}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <Reveal className="relative order-first lg:order-last">
            {profile?.photoUrl ? (
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2.5rem] bg-warm-soft" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.photoUrl}
                  alt={`${displayName} portrait`}
                  className="aspect-[4/5] w-full rounded-[2rem] border border-line object-cover"
                />
              </div>
            ) : (
              <HeroMonogram name={displayName} title={displayTitle} />
            )}
          </Reveal>
        </Container>
      </section>

      {/* ── About snapshot ── */}
      {bio && (
        <section className="border-b border-line/70 bg-surface/40">
          <Container className="py-20 sm:py-28">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-[0.4fr_1fr] lg:items-start">
                <p className="flex items-center gap-2 pt-1">
                  <span className="size-1.5 rounded-full bg-warm" aria-hidden />
                  <span className="text-[0.8rem] font-bold text-primary">About</span>
                </p>
                <div className="max-w-3xl">
                  <p className="font-display text-2xl leading-[1.25] text-ink sm:text-3xl">
                    {shorten(bio, 320)}
                  </p>
                  <div className="mt-7">
                    <Button href="/about" variant="outline">
                      More about me
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {/* ── Selected projects ── */}
      {(featured.length > 0 || otherProjects.length > 0) && (
        <section className="border-b border-line/70">
          <Container className="py-20 sm:py-28">
            <Reveal>
              <SectionHeading
                eyebrow="Selected projects"
                title="Work that matters"
                description="A look at the systems and products I design, build, and operate."
                action={
                  <Button href="/projects" variant="ghost">
                    All projects
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                }
              />
            </Reveal>

            {featured.length > 0 && (
              <Reveal className="mt-12">
                <ProjectCard project={featured[0]} large />
              </Reveal>
            )}

            {(featured.length > 1 ? featured.slice(1) : otherProjects).length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(featured.length > 1 ? featured.slice(1) : otherProjects)
                  .slice(0, 3)
                  .map((project, i) => (
                    <Reveal key={project.id} delay={i * 70}>
                      <ProjectCard project={project} />
                    </Reveal>
                  ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* ── Experience snapshot ── */}
      {latestExperience.length > 0 && (
        <section className="border-b border-line/70 bg-surface/40">
          <Container className="py-20 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeading
                  eyebrow="Experience"
                  title="Recent work"
                  action={
                    <Button href="/experience" variant="ghost" className="lg:mt-6">
                      Full timeline
                    </Button>
                  }
                />
              </div>

              <ol className="relative space-y-2">
                {latestExperience.map((exp, i) => (
                  <Reveal key={exp.id} delay={i * 60}>
                    <li className="relative rounded-2xl border border-line/70 bg-surface px-6 py-6 transition-colors hover:border-primary/30">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-display text-2xl tracking-tight">{exp.title}</h3>
                        <span className="tech-label text-muted">
                          {formatDateRange(exp.startDate, exp.current ? undefined : exp.endDate)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-primary-deep">{exp.company}</p>
                      {exp.description && (
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft/85">
                          {exp.description}
                        </p>
                      )}
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      )}

      {/* ── Skills preview ── */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="border-b border-line/70">
          <Container className="py-20 sm:py-28">
            <Reveal>
              <SectionHeading
                eyebrow="Capabilities"
                title="What I work with"
                description="The engineering breadth I reach for across projects."
                action={
                  <Button href="/skills" variant="ghost" className="hidden sm:inline-flex">
                    All skills
                  </Button>
                }
              />
            </Reveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {Object.entries(skillsByCategory)
                .slice(0, 3)
                .map(([category, items], i) => (
                  <Reveal key={category} delay={i * 70}>
                    <div className="h-full rounded-3xl border border-line/70 bg-surface p-7">
                      <p className="text-[0.8rem] font-bold text-primary">{category}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {items.slice(0, 8).map((skill) => (
                          <li
                            key={skill.id}
                            className="rounded-full border border-line/80 bg-paper px-3 py-1.5 text-sm font-medium text-ink-soft"
                          >
                            {skill.name}
                          </li>
                        ))}
                        {items.length > 8 && (
                          <li className="rounded-full px-2 py-1.5 text-sm text-muted">
                            +{items.length - 8}
                          </li>
                        )}
                      </ul>
                    </div>
                  </Reveal>
                ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <section className="border-b border-line/70 bg-surface/40">
          <Container className="py-20 sm:py-28">
            <Reveal>
              <SectionHeading eyebrow="Education" title="Foundations" />
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {education.slice(0, 2).map((edu, i) => (
                <Reveal key={edu.id} delay={i * 70}>
                  <div className="flex flex-col rounded-3xl border border-line/70 bg-surface p-7">
                    <span className="tech-label text-muted">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </span>
                    <h3 className="mt-3 font-display text-2xl tracking-tight">{edu.degree}</h3>
                    <p className="text-sm font-semibold text-primary-deep">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="mt-2 text-[0.95rem] text-ink-soft">{edu.fieldOfStudy}</p>
                    )}
                    {edu.gpa && <p className="mt-2 text-xs text-muted">GPA {edu.gpa}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Contact / CTA ── */}
      <section>
        <Container className="py-20 sm:py-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-surface sm:px-16 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-warm/20 blur-3xl"
              />
              <p className="flex items-center gap-2 text-sm font-bold text-surface/80">
                <span className="size-1.5 rounded-full bg-warm" aria-hidden />
                Let&apos;s work together
              </p>
              <h2 className="mt-4 max-w-2xl text-balance font-display text-4xl leading-tight sm:text-5xl">
                Have a project or a problem worth solving?
              </h2>
              <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-surface/85">
                I&apos;m glad to talk through your idea — infrastructure,
                software, or both. Let&apos;s start a conversation.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  href={profile?.email ? `mailto:${profile.email}` : "/contact"}
                  size="lg"
                  className="bg-surface text-primary hover:bg-surface/90"
                >
                  Get in touch
                </Button>
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center gap-2 rounded-full border border-surface/30 px-5 text-sm font-semibold text-surface transition-colors hover:bg-surface/10"
                      >
                        {link.label}
                        <ArrowUpRight className="size-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

/** Portrait placeholder — an intentional, editorial monogram composition. */
function HeroMonogram({ name, title }: { name: string; title: string }) {
  const initial = name.charAt(0) || "S";
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-line bg-primary-soft">
      <div className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,_rgba(15,107,98,0.16)_1px,_transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute inset-0 flex items-center justify-center font-display italic text-primary/[0.92]">
        <span className="text-[11rem] leading-none">{initial}</span>
      </div>
      <div className="absolute left-6 top-6 max-w-[11rem]">
        <p className="text-[0.82rem] font-bold leading-snug text-primary-deep">{name}</p>
      </div>
      <div className="tech-label absolute bottom-6 left-6 max-w-[13rem] text-primary/80">
        {title}
      </div>
      <span
        aria-hidden
        className="absolute bottom-6 right-6 size-3 rounded-full bg-warm"
      />
    </div>
  );
}

function SvgPin() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-primary"
    >
      <path d="M8 15s5-4.2 5-8a5 5 0 1 0-10 0c0 3.8 5 8 5 8Z" />
      <circle cx="8" cy="7" r="1.6" />
    </svg>
  );
}

function groupSkills(skills: { id: string; name: string; category: string }[]) {
  const map = new Map<string, { id: string; name: string; category: string }[]>();
  for (const skill of skills) {
    const list = map.get(skill.category) ?? [];
    list.push(skill);
    map.set(skill.category, list);
  }
  return Object.fromEntries(map.entries()) as Record<string, typeof skills>;
}

function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
