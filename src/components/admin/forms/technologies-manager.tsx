"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createTechnology,
  deleteTechnology,
  updateTechnology,
} from "@/app/admin/actions/technology";
import type { Technology } from "@/generated/prisma/client";

type TechnologiesManagerProps = {
  technologies: (Technology & { _count: { projects: number } })[];
};

export function TechnologiesManager({
  technologies,
}: TechnologiesManagerProps) {
  const [createState, createAction] = useActionState(
    createTechnology,
    initialState,
  );
  const [updateState, updateAction] = useActionState(
    updateTechnology,
    initialState,
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-line bg-surface p-4">
        <form action={createAction} className="grid gap-3">
          <p className="text-sm font-medium">Add a technology</p>
          <div className="grid gap-2">
            <Field label="Name">
              <Input name="name" placeholder="e.g. React, Node.js, MikroTik" required />
            </Field>
            {createState.error && (
              <p className="text-sm text-danger" role="alert">
                {createState.error}
              </p>
            )}
          </div>
          <div>
            <Button type="submit" size="sm" variant="outline">
              Add
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {technologies.length} {technologies.length === 1 ? "technology" : "technologies"}
        </p>

        {technologies.length === 0 && (
          <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
            No technologies yet. Add your first one on the left.
          </p>
        )}

        {technologies.map((tech) => (
          <div
            key={tech.id}
            className="flex flex-col gap-3 rounded-xl border border-line bg-paper/40 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{tech.name}</p>
              <p className="text-xs text-muted">
                Used in {tech._count.projects}{" "}
                {tech._count.projects === 1 ? "project" : "projects"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <form action={updateAction} className="flex gap-2">
                <input type="hidden" name="id" value={tech.id} />
                <Input
                  name="name"
                  defaultValue={tech.name}
                  aria-label={`Rename ${tech.name}`}
                  className="h-9 w-40"
                  required
                />
                {updateState.error && (
                  <span className="text-xs text-danger" role="alert">
                    {updateState.error}
                  </span>
                )}
                <Button type="submit" size="sm" variant="ghost">
                  Rename
                </Button>
              </form>
              <form action={deleteTechnology}>
                <input type="hidden" name="id" value={tech.id} />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="text-danger hover:bg-danger/5 hover:text-danger"
                >
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}