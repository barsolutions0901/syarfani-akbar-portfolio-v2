"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  createEducation,
  deleteEducation,
  moveEducation,
  toggleEducationPublish,
  updateEducation,
} from "@/app/admin/actions/education";
import type { Education } from "@/generated/prisma/client";

type Props = {
  items: Education[];
};

function toDateInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function EducationManager({ items }: Props) {
  const [createState, createAction] = useActionState(createEducation, initialState);
  const [updateState, updateAction] = useActionState(updateEducation, initialState);

  return (
    <div className="grid gap-6">
      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Add an education entry
        </summary>
        <form action={createAction} className="mt-4 grid gap-3">
          <Field label="Institution">
            <Input name="institution" placeholder="e.g. Universitas Indonesia" required />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Degree">
              <Input name="degree" placeholder="e.g. Bachelor of Computer Science" required />
            </Field>
            <Field label="Field of study">
              <Input name="fieldOfStudy" placeholder="e.g. Informatics" />
            </Field>
            <Field label="Start date">
              <Input name="startDate" type="date" required />
            </Field>
            <Field label="End date (leave empty if ongoing)">
              <Input name="endDate" type="date" />
            </Field>
            <Field label="GPA (optional)">
              <Input name="gpa" placeholder="e.g. 3.8/4.0" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked className="size-4 accent-primary" />
              Published
            </label>
          </div>
          <Field label="Description">
            <Textarea name="description" placeholder="Highlights, thesis, or achievements." />
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
            No education yet. Add your first entry above.
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
              <p className="font-medium">
                {item.degree} · {item.institution}
              </p>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={toggleEducationPublish}
                className={item.isPublished ? "text-success" : "text-muted"}
              >
                {item.isPublished ? "Published" : "Draft"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Institution">
                <Input name="institution" defaultValue={item.institution} required />
              </Field>
              <Field label="Degree">
                <Input name="degree" defaultValue={item.degree} required />
              </Field>
              <Field label="Field of study">
                <Input name="fieldOfStudy" defaultValue={item.fieldOfStudy ?? ""} />
              </Field>
              <Field label="GPA">
                <Input name="gpa" defaultValue={item.gpa ?? ""} />
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
              <Button type="submit" size="sm" variant="ghost" formAction={moveEducation} name="direction" value="up" aria-label="Move up">
                ↑
              </Button>
              <Button type="submit" size="sm" variant="ghost" formAction={moveEducation} name="direction" value="down" aria-label="Move down">
                ↓
              </Button>
              <div className="flex-1" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={deleteEducation}
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
