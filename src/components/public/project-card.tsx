import Link from "next/link";

import { ArrowUpRight } from "@/components/icons/arrows";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type ProjectCardData = {
  title: string;
  slug: string;
  category: string | null;
  status: string | null;
  shortDescription: string;
  images: { url: string; alt: string | null; isThumbnail: boolean }[];
  technologies: { name: string }[];
};

export function ProjectCard({
  project,
  large = false,
  className,
}: {
  project: ProjectCardData;
  large?: boolean;
  className?: string;
}) {
  const thumbnail =
    project.images.find((i) => i.isThumbnail)?.url ?? project.images[0]?.url;
  const hasImage = Boolean(thumbnail);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-line/80 bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_rgba(15,107,98,0.45)]",
        large ? "md:flex-row" : "",
        className,
      )}
    >
      {/* Visual region: real image or intentional no-image composition */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-paper-deep",
          large ? "aspect-[16/10] md:aspect-auto md:flex-[1.25_1.25_0%] md:self-stretch" : "aspect-[16/10]",
        )}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail!}
            alt={project.images.find((i) => i.isThumbnail)?.alt ?? project.title}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <NoImageComposition title={project.title} large={large} />
        )}
        {!large && (
          <div className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-surface/90 text-ink opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col justify-center gap-3",
          large ? "md:max-w-[26rem] md:gap-4 md:p-10" : "p-6",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {project.category && <Badge tone="primary">{project.category}</Badge>}
          {project.status && <Badge tone="outline">{project.status}</Badge>}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "font-display tracking-tight",
              large ? "text-4xl leading-[1.05]" : "text-2xl leading-tight",
            )}
          >
            {project.title}
          </h3>
          {large && (
            <span className="mt-1 shrink-0 translate-y-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowUpRight className="size-6" />
            </span>
          )}
        </div>

        <p className={cn("leading-relaxed text-ink-soft/85", large ? "text-[0.98rem]" : "text-[0.92rem]")}>
          {project.shortDescription}
        </p>

        {project.technologies.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech.name}
                className="rounded-full border border-line/80 bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft"
              >
                {tech.name}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="rounded-full px-2 py-1 text-xs font-medium text-muted">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          View case study
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Intentional composition when a project has no screenshot yet. */
function NoImageComposition({
  title,
  large,
}: {
  title: string;
  large: boolean;
}) {
  return (
    <div className="absolute inset-0">
      {/* soft accent backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-warm/[0.14]" />

      {/* architectural grid marks */}
      <div className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,_rgba(15,107,98,0.18)_1px,_transparent_1px)] [background-size:26px_26px]" />

      {/* floating serif monogram */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center font-display leading-none text-primary/[0.16]",
          large ? "text-[10rem]" : "text-[7rem]",
        )}
      >
        {title.charAt(0)}
      </div>

      {/* status chip */}
      <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface/85 px-3 py-1.5 backdrop-blur">
        <span className="size-2 rounded-full bg-warm" aria-hidden />
        <span className="text-xs font-medium text-ink-soft">Screenshot coming soon</span>
      </div>
    </div>
  );
}
