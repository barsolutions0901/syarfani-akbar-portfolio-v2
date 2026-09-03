"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createSkill,
  deleteSkill,
  moveSkill,
  toggleSkillPublish,
  updateSkill,
} from "@/app/admin/actions/skills";
import type { Skill } from "@/generated/prisma/client";

type Props = {
  items: Skill[];
};

export function SkillsManager({ items }: Props) {
  const [createState, createAction] = useActionState(createSkill, initialState);
  const [updateState, updateAction] = useActionState(updateSkill, initialState);

  return (
    <div className="grid gap-6">
      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">Add a skill</summary>
        <form action={createAction} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <Input name="name" placeholder="e.g. Docker" required />
            </Field>
            <Field label="Category">
              <Input name="category" placeholder="e.g. DevOps" required />
            </Field>
            <Field label="Level (optional)">
              <Input name="level" placeholder="e.g. Advanced" />
            </Field>
            <Field label="Order (lower appears first)">
              <Input name="order" type="number" defaultValue={0} min={0} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked className="size-4 accent-primary" />
              Published
            </label>
          </div>
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
            No skills yet. Add your first skill above.
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
                {item.name}
                {item.category && <span className="ml-2 text-sm text-muted">· {item.category}</span>}
              </p>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={toggleSkillPublish}
                className={item.isPublished ? "text-success" : "text-muted"}
              >
                {item.isPublished ? "Published" : "Draft"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input name="name" defaultValue={item.name} required />
              </Field>
              <Field label="Category">
                <Input name="category" defaultValue={item.category} required />
              </Field>
              <Field label="Level">
                <Input name="level" defaultValue={item.level ?? ""} />
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

            {updateState.error && (
              <p className="text-sm text-danger" role="alert">
                {updateState.error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button type="submit" size="sm" variant="ghost" formAction={moveSkill} name="direction" value="up" aria-label="Move up">
                ↑
              </Button>
              <Button type="submit" size="sm" variant="ghost" formAction={moveSkill} name="direction" value="down" aria-label="Move down">
                ↓
              </Button>
              <div className="flex-1" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={deleteSkill}
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
