"use client";

import { useActionState, useState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createSocialLink,
  deleteSocialLink,
  updateSocialLink,
} from "@/app/admin/actions/social";
import type { SocialLink } from "@/generated/prisma/client";

type SocialLinksManagerProps = {
  links: SocialLink[];
};

export function SocialLinksManager({ links }: SocialLinksManagerProps) {
  const [state, createAction] = useActionState(createSocialLink, initialState);
  const [, updateAction] = useActionState(updateSocialLink, initialState);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      {links.map((link) => (
        <div
          key={link.id}
          className="flex flex-col gap-3 rounded-xl border border-line bg-paper/40 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{link.label}</p>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline underline-offset-2"
            >
              {link.url}
            </a>
            {!link.isPublished && (
              <p className="mt-1 text-xs text-muted">Hidden from public site</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingId(editingId === link.id ? null : link.id)}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft"
            >
              {editingId === link.id ? "Cancel" : "Edit"}
            </button>
            <form action={deleteSocialLink}>
              <input type="hidden" name="id" value={link.id} />
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/5"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      ))}

      {links.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
          No social links yet. Add your first one below.
        </p>
      )}

      <div className="rounded-xl border border-line bg-surface p-4">
        {editingId ? (
          <form
            action={updateAction}
            className="grid gap-3"
            onSubmit={() => setEditingId(null)}
          >
            <input
              type="hidden"
              name="id"
              value={editingId}
            />
            <EditFields link={links.find((l) => l.id === editingId)} />
            <div>
              <Button type="submit" size="sm">
                Save change
              </Button>
            </div>
          </form>
        ) : (
          <form action={createAction} className="grid gap-3">
            <p className="text-sm font-medium">Add a social link</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Label">
                <Input name="label" placeholder="GitHub" required />
              </Field>
              <Field label="URL" className="sm:col-span-2">
                <Input
                  name="url"
                  type="url"
                  placeholder="https://…"
                  required
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked
                className="size-4 accent-primary"
              />
              Visible on public site
            </label>
            {state.error && (
              <p className="text-sm text-danger" role="alert">
                {state.error}
              </p>
            )}
            <div>
              <Button type="submit" size="sm" variant="outline">
                Add link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EditFields({ link }: { link?: SocialLink }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label">
          <Input name="label" defaultValue={link?.label ?? ""} required />
        </Field>
        <Field label="URL">
          <Input name="url" type="url" defaultValue={link?.url ?? ""} required />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={link?.isPublished ?? true}
          className="size-4 accent-primary"
        />
        Visible on public site
      </label>
    </div>
  );
}