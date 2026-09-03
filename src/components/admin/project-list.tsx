"use client";

import Link from "next/link";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import {
  deleteProject,
  moveProject,
  toggleFeatured,
  togglePublish,
} from "@/app/admin/actions/project";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  order: number;
  isFeatured: boolean;
  isPublished: boolean;
  category: string | null;
  thumbnail: { url: string } | null;
};

type ProjectListProps = {
  projects: ProjectRow[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-3">
      {projects.map((project, index) => (
        <ProjectListItem
          key={project.id}
          project={project}
          isFirst={index === 0}
          isLast={index === projects.length - 1}
        />
      ))}
      {projects.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          No projects yet. Create your first project to get started.
        </p>
      )}
    </div>
  );
}

function ProjectListItem({
  project,
  isFirst,
  isLast,
}: {
  project: ProjectRow;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {project.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail.url}
            alt=""
            className="size-12 shrink-0 rounded-lg border border-line object-cover"
          />
        ) : (
          <div className="size-12 shrink-0 rounded-lg border border-line bg-muted/10" />
        )}
        <div className="min-w-0">
          <Link
            href={`/admin/projects/${project.id}`}
            className="block truncate font-medium hover:underline"
          >
            {project.title}
          </Link>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs text-muted">/{project.slug}</span>
            {project.category && (
              <Badge tone="neutral">{project.category}</Badge>
            )}
            {project.isFeatured && <Badge tone="warm">Featured</Badge>}
            {project.isPublished ? (
              <Badge tone="primary">Published</Badge>
            ) : (
              <Badge>Draft</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <ArrowAction project={project} direction="up" disabled={isFirst} />
        <ArrowAction project={project} direction="down" disabled={isLast} />

        <form action={togglePublish}>
          <input type="hidden" name="id" value={project.id} />
          <input
            type="hidden"
            name="current"
            value={String(project.isPublished)}
          />
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft"
          >
            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </form>

        <form action={toggleFeatured}>
          <input type="hidden" name="id" value={project.id} />
          <input
            type="hidden"
            name="current"
            value={String(project.isFeatured)}
          />
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-[#7a520f] hover:bg-warm-soft"
          >
            {project.isFeatured ? "Unfeature" : "Feature"}
          </button>
        </form>

        <Link
          href={`/admin/projects/${project.id}`}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-ink/5"
        >
          Edit
        </Link>

        <DeleteProjectButton id={project.id} />
      </div>
    </div>
  );
}

function ArrowAction({
  project,
  direction,
  disabled,
}: {
  project: ProjectRow;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        startTransition(async () => {
          const formData = new FormData();
          formData.set("id", project.id);
          formData.set("direction", direction);
          await moveProject(formData);
        })
      }
      aria-label={`Move ${project.title} ${direction}`}
      className="rounded-full p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "up" ? (
          <path d="M4 10l4-4 4 4" />
        ) : (
          <path d="M4 6l4 4 4-4" />
        )}
      </svg>
    </button>
  );
}

function DeleteProjectButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => {
        const formData = new FormData();
        formData.set("id", id);
        void deleteProject(formData);
      })}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
    >
      Delete
    </button>
  );
}