"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  createSetting,
  deleteSetting,
  updateSetting,
} from "@/app/admin/actions/settings";
import type { SiteSetting } from "@/generated/prisma/client";

type Props = {
  items: SiteSetting[];
};

export function SettingsManager({ items }: Props) {
  const [createState, createAction] = useActionState(createSetting, initialState);
  const [updateState, updateAction] = useActionState(updateSetting, initialState);

  return (
    <div className="grid gap-6">
      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Add a site setting
        </summary>
        <form action={createAction} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Key">
              <Input name="key" placeholder="e.g. contact.email" required />
            </Field>
          </div>
          <Field label="Value">
            <Textarea name="value" placeholder="The value for this key." required />
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
            No settings yet. Add your first setting above.
          </p>
        )}

        {items.map((item) => (
          <form
            key={item.id}
            action={updateAction}
            className="grid gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <input type="hidden" name="id" value={item.id} />
            <Field label="Key">
              <Input name="key" defaultValue={item.key} required />
            </Field>
            <Field label="Value">
              <Textarea name="value" defaultValue={item.value} required />
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
              <div className="flex-1" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={deleteSetting}
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
