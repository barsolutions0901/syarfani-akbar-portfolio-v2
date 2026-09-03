import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight } from "@/components/icons/arrows";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { SectionHeading } from "@/components/public/section-heading";
import { Reveal } from "@/components/site/reveal";
import { getPublicProfile } from "@/lib/queries";
import { getPublishedEducation } from "@/lib/queries";
import { getPublishedSkills } from "@/lib/queries";
import { getPublishedSocialLinks } from "@/lib/queries";
import { formatDateRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Syarfani Akbar — an IT infrastructure engineer and innovation partner",
};

export default async function AboutPage() {
  const [profile, education, skills, socialLinks] = await Promise.all([
    getPublicProfile(),
    getPublishedEducation(),
    getPublishedSkills(),
    getPublishedSocialLinks(),
  ]);

  const skillsByCategory = groupByCategory(skills);

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={
          <>
            Software, infrastructure, and ideas —{" "}
            <em className="font-display italic text-primary">built with care.</em>
          </>
        }
        intro={
          profile?.bio
            ? undefined
            : "This section fills in from the admin panel as your profile grows."
        }
      />

      {!profile?.name && !profile?.bio && (
        <Container>
          <EmptyState title="Profile not set up yet">
            Your profile content will appear here once it is written in the admin
            panel.
          </EmptyState>
        </Container>
      )}

      <Container className="pb-24 pt-6">
        {profile && (profile.bio || profile.location || profile.photoUrl) && (
          <Reveal>
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
              {(profile.photoUrl || profile.location) && (
                <div>
                  {profile.photoUrl ? (
                    <div className="relative max-w-xs">
                      <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-warm-soft" aria-hidden />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.photoUrl}
                        alt={`${profile.name} portrait`}
                        className="aspect-[4/5] w-full rounded-[2rem] border border-line object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[2rem] border border-line bg-primary-soft">
                      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle,_rgba(15,107,98,0.16)_1px,_transparent_1px)] [background-size:20px_20px]" />
                      <div className="absolute inset-0 flex items-center justify-center font-display italic text-primary/[0.9]">
                        <span className="text-[9rem] leading-none">{(profile.name ?? "S").charAt(0)}</span>
                      </div>
                    </div>
                  )}
                  {profile.location && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                      <span className="size-1.5 rounded-full bg-warm" aria-hidden />
                      Based in {profile.location}
                    </p>
                  )}
                </div>
              )}

              <div className="max-w-2xl">
                {profile.bio && (
                  <div className="space-y-6">
                    {profile.bio.split(/\n{2,}/).map((paragraph, i) => (
                      <p key={i} className="text-pretty font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
                {profile.availability && (
                  <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-primary-deep">
                    <span className="size-2 rounded-full bg-warm" aria-hidden />
                    {profile.availability}
                  </p>
                )}
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/projects">
                    View projects
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                  <Button href="/contact" variant="outline">
                    Get in touch
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mt-24 border-t border-line/70 pt-14">
            <SectionHeading eyebrow="Education" title="Foundations" />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {education.map((edu, i) => (
                <Reveal key={edu.id} delay={i * 70}>
                  <div className="flex h-full flex-col rounded-3xl border border-line/70 bg-surface p-7">
                    <span className="tech-label text-muted">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </span>
                    <h3 className="mt-3 font-display text-2xl tracking-tight">{edu.degree}</h3>
                    <p className="text-sm font-semibold text-primary-deep">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="mt-2 text-[0.95rem] text-ink-soft">{edu.fieldOfStudy}</p>
                    )}
                    {edu.description && (
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                        {edu.description}
                      </p>
                    )}
                    {edu.gpa && <p className="mt-3 text-xs text-muted">GPA {edu.gpa}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <section className="mt-24 border-t border-line/70 pt-14">
            <SectionHeading
              eyebrow="Capabilities"
              title="What I work with"
              description="The engineering breadth I reach for across projects."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(skillsByCategory).map(([category, items], i) => (
                <Reveal key={category} delay={i * 70}>
                  <div className="h-full rounded-3xl border border-line/70 bg-surface p-7">
                    <p className="text-[0.8rem] font-bold text-primary">{category}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-full border border-line/80 bg-paper px-3 py-1.5 text-sm font-medium text-ink-soft"
                        >
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Social / CTA */}
        {(profile?.email || socialLinks.length > 0) && (
          <div className="mt-24 rounded-[2.5rem] border border-line/70 bg-surface p-10 sm:p-14">
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-warm" aria-hidden />
              <span className="text-[0.8rem] font-bold text-primary">Let&apos;s connect</span>
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
              Curious about working together?
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {profile?.email && (
                <Link
                  href={`mailto:${profile.email}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-surface transition-colors hover:bg-primary-deep"
                >
                  {profile.email}
                </Link>
              )}
              {socialLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

function groupByCategory(skills: { id: string; name: string; category: string }[]) {
  const map = new Map<string, { id: string; name: string }[]>();
  for (const skill of skills) {
    const list = map.get(skill.category) ?? [];
    list.push({ id: skill.id, name: skill.name });
    map.set(skill.category, list);
  }
  return Object.fromEntries(map.entries()) as Record<string, { id: string; name: string }[]>;
}
