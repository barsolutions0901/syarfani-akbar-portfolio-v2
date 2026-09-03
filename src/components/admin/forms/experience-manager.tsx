"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  createExperience,
  deleteExperience,
  moveExperience,
  toggleExperiencePublish,
  updateExperience,
} from "@/app/admin/actions/experience";
import type { Experience } from "@/generated/prisma/client";

type Props = {
  items: Experience[];
};

function toDateInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ExperienceManager({ items }: Props) {
  const [createState, createAction] = useActionState(createExperience, initialState);
  const [updateState, updateAction] = useActionState(updateExperience, initialState);

  return (
    <div className="grid gap-6">
      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Add an experience entry
        </summary>
        <form action={createAction} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input name="title" placeholder="e.g. IT Infrastructure Engineer" required />
            </Field>
            <Field label="Company">
              <Input name="company" placeholder="e.g. Acme Corp" required />
            </Field>
            <Field label="Location">
              <Input name="location" placeholder="e.g. Jakarta, Indonesia" />
            </Field>
            <Field label="Start date">
              <Input name="startDate" type="date" required />
            </Field>
            <Field label="End date (leave empty if current)">
              <Input name="endDate" type="date" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="current" className="size-4 accent-primary" />
              Currently working here
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked className="size-4 accent-primary" />
              Published
            </label>
          </div>
          <Field label="Description">
            <Textarea name="description" placeholder="A short summary of the role." />
          </Field>
          <Field label="Order (lower appears first)">
            <Input name="order" type="number" defaultValue={0} min={0} />
          </Field>
          {createState.error && (
            <p className="text-sm text-danger" role="alert">
              {createState.error}
            </p>
          )}
          <div>
            <Button type="submit" size="sm" variant="outline">
              Add
            </Button>
          </div>
        </form>
      </details>

      <div className="grid gap-3">
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
            No experience yet. Add your first entry above.
          </p>
        )}

        {items.map((item) => (
          <form
            key={item.id}
            action={updateAction}
            className="grid gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="current" value={String(item.isPublished)} />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{item.title}</p>
              <div className="flex items-center gap-1">
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  formAction={toggleExperiencePublish}
                  className={item.isPublished ? "text-success" : "text-muted"}
                >
                  {item.isPublished ? "Published" : "Draft"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <Input name="title" defaultValue={item.title} required />
              </Field>
              <Field label="Company">
                <Input name="company" defaultValue={item.company} required />
              </Field>
              <Field label="Location">
                <Input name="location" defaultValue={item.location ?? ""} />
              </Field>
              <Field label="Start date">
                <Input name="startDate" type="date" defaultValue={toDateInput(item.startDate)} required />
              </Field>
              <Field label="End date">
                <Input name="endDate" type="date" defaultValue={toDateInput(item.endDate)} />
              </Field>
              <Field label="Order">
                <Input name="order" type="number" defaultValue={item.order} min={0} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="current" defaultChecked={item.current} className="size-4 accent-primary" />
                Currently working here
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={item.isPublished}
                  className="size-4 accent-primary"
                />
                Published
              </label>
            </div>
            <Field label="Description">
              <Textarea name="description" defaultValue={item.description ?? ""} />
            </Field>

            {updateState.error && (
              <p className="text-sm text-danger" role="alert">
                {updateState.error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button type="submit" size="sm" variant="ghost" formAction={moveExperience} name="direction" value="up" aria-label="Move up">
                ↑
              </Button>
              <Button type="submit" size="sm" variant="ghost" formAction={moveExperience} name="direction" value="down" aria-label="Move down">
                ↓
              </Button>
              <div className="flex-1" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={deleteExperience}
                className="text-danger hover:bg-danger/5 hover:text-danger"
              >
                Delete
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
