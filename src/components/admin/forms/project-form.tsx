"use client";

import { useActionState, useState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea, Select } from "@/components/ui/input";
import { ImageUpload } from "@/components/upload/image-upload";
import {
  createProject,
  updateProject,
} from "@/app/admin/actions/project";
import type { Project, ProjectImage, Technology } from "@/generated/prisma/client";

export type ProjectWithRelations = {
  project:
    | (Project & { images: ProjectImage[]; technologies: Technology[] })
    | null;
  technologies: Technology[];
};

type ProjectFormProps = ProjectWithRelations & {
  isNew: boolean;
};

export function ProjectForm({
  project,
  technologies,
  isNew,
}: ProjectFormProps) {
  const action = isNew ? createProject : updateProject;
  const [state, formAction, pending] = useActionState(action, initialState);

  const proposedSlug = project?.slug ?? "";
  const thumbnail = project?.images.find((i) => i.isThumbnail)?.url ?? "";
  const gallery = project
    ? project.images.filter((i) => !i.isThumbnail).map((i) => i.url)
    : [];
  const selectedTech = new Set(
    project?.technologies?.map((t) => t.id) ?? [],
  );

  return (
    <form action={formAction} className="grid gap-8">
      {project && <input type="hidden" name="id" value={project.id} />}

      {/* Title & slug */}
      <section className="grid gap-5">
        <h2 className="font-display text-lg font-semibold">Basics</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <Input name="title" defaultValue={project?.title ?? ""} required />
          </Field>
          <Field label="Slug" hint="Leave empty to auto-generate from the title">
            <Input
              name="slug"
              defaultValue={proposedSlug}
              placeholder="my-project"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <Input name="category" defaultValue={project?.category ?? ""} />
            </Field>
            <Field label="Client">
              <Input name="client" defaultValue={project?.client ?? ""} />
            </Field>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status">
            <Select name="status" defaultValue={project?.status ?? ""}>
              <option value="">—</option>
              <option>Completed</option>
              <option>Ongoing</option>
              <option>In progress</option>
              <option>Archived</option>
            </Select>
          </Field>
          <Field label="Order (lower comes first)">
            <Input
              name="order"
              type="number"
              min={0}
              defaultValue={project?.order ?? 0}
            />
          </Field>
          <Field label="Start date">
            <Input
              name="startDate"
              type="date"
              defaultValue={toDateInput(project?.startDate)}
            />
          </Field>
          <Field label="End date">
            <Input
              name="endDate"
              type="date"
              defaultValue={toDateInput(project?.endDate)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={project?.isFeatured ?? false}
              className="size-4 accent-primary"
            />
            Featured project
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={project?.isPublished ?? isNew ? false : false}
              className="size-4 accent-primary"
            />
            Published
          </label>
        </div>
      </section>

      {/* Description */}
      <section className="grid gap-5">
        <h2 className="font-display text-lg font-semibold">Description</h2>
        <Field label="Short description" hint="One or two lines shown in cards">
          <Textarea
            className="min-h-16"
            name="shortDescription"
            defaultValue={project?.shortDescription ?? ""}
            required
          />
        </Field>
        <Field label="Full description / case study">
          <Textarea
            className="min-h-40"
            name="description"
            defaultValue={project?.description ?? ""}
          />
        </Field>
        <Field label="Overview">
          <Textarea name="overview" defaultValue={project?.overview ?? ""} />
        </Field>
        <Field label="Role">
          <Input name="role" defaultValue={project?.role ?? ""} />
        </Field>
      </section>

      {/* Case study */}
      <section className="grid gap-5">
        <h2 className="font-display text-lg font-semibold">Case study</h2>
        {(["features", "challenges", "solutions", "results", "architecture"] as const).map(
          (key) => (
            <Field key={key} label={labelFor(key)}>
              <Textarea
                name={key}
                defaultValue={(project?.[key] as string) ?? ""}
              />
            </Field>
          ),
        )}
      </section>

      {/* Links */}
      <section className="grid gap-5">
        <h2 className="font-display text-lg font-semibold">Links</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Live URL">
            <Input
              name="liveUrl"
              type="url"
              defaultValue={project?.liveUrl ?? ""}
              placeholder="https://…"
            />
          </Field>
          <Field label="GitHub URL">
            <Input
              name="githubUrl"
              type="url"
              defaultValue={project?.githubUrl ?? ""}
              placeholder="https://…"
            />
          </Field>
        </div>
      </section>

      {/* Technologies */}
      <section className="grid gap-5">
        <h2 className="font-display text-lg font-semibold">Technologies</h2>
        {technologies.length === 0 ? (
          <p className="text-sm text-muted">
            No technologies exist yet. Add some in the{" "}
            <a href="/admin/technologies" className="text-primary underline underline-offset-2">
              Technologies
            </a>{" "}
            module first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <label
                key={tech.id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink-soft transition-colors has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary-deep"
              >
                <input
                  type="checkbox"
                  name="technologyIds"
                  value={tech.id}
                  defaultChecked={selectedTech.has(tech.id)}
                  className="size-4 accent-primary"
                />
                {tech.name}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Images */}
      <section className="grid gap-5">
        <h2 className="font-display text-lg font-semibold">Images</h2>
        <Field label="Thumbnail" hint="Main image shown on cards and social previews">
          <ThumbnailUpload initial={thumbnail} />
          <input
            type="hidden"
            name="thumbnailTouched"
            defaultValue="false"
          />
        </Field>
        <Field label="Gallery" hint="Additional screenshots of the project">
          <GalleryUpload initial={gallery} />
          <input type="hidden" name="galleryUrls" defaultValue="" />
        </Field>
      </section>

      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/5 px-3.5 py-2.5 text-sm text-success">
          {isNew ? "Project created." : "Project saved."}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isNew ? "Create project" : "Save changes"}
        </Button>
        <Button variant="outline" href="/admin/projects">
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Uploads and stores the thumbnail URL in a hidden control. */
function ThumbnailUpload({
  initial,
}: {
  initial: string;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState(initial);
  return (
    <>
      <ImageUpload
        kind="gallery"
        value={thumbnailUrl}
        onChange={(url) => {
          setThumbnailUrl(url);
          // mark thumbnail touched once an upload completes/clears
        }}
        label="Upload thumbnail"
      />
      <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
    </>
  );
}

/** Uploads gallery images; keeps a JSON list in a hidden control. */
function GalleryUpload({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  return (
    <div className="grid gap-3">
      <ImageUpload
        kind="gallery"
        value=""
        onChange={(url) => {
          if (!url) return;
          setUrls((prev) => [...prev, url]);
        }}
        label="Add to gallery"
      />
      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url) => (
            <li
              key={url}
              className="relative aspect-video overflow-hidden rounded-lg border border-line bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Remove"
                className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-ink/70 text-surface"
                onClick={() => setUrls((prev) => prev.filter((u) => u !== url))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name="galleryUrls" value={JSON.stringify(urls)} />
    </div>
  );
}

function toDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

const sectionLabels: Record<string, string> = {
  features: "Features",
  challenges: "Challenges",
  solutions: "Solutions",
  results: "Results",
  architecture: "Architecture",
};

function labelFor(key: string): string {
  return sectionLabels[key] ?? key;
}