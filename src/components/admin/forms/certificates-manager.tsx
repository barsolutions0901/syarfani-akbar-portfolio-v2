"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createCertificate,
  deleteCertificate,
  moveCertificate,
  toggleCertificatePublish,
  updateCertificate,
} from "@/app/admin/actions/certificates";
import type { Certificate } from "@/generated/prisma/client";

type Props = {
  items: Certificate[];
};

function toDateInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CertificatesManager({ items }: Props) {
  const [createState, createAction] = useActionState(createCertificate, initialState);
  const [updateState, updateAction] = useActionState(updateCertificate, initialState);

  return (
    <div className="grid gap-6">
      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Add a certificate
        </summary>
        <form action={createAction} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input name="title" placeholder="e.g. AWS Certified Solutions Architect" required />
            </Field>
            <Field label="Issuer">
              <Input name="issuer" placeholder="e.g. AWS" required />
            </Field>
            <Field label="Issue date">
              <Input name="issueDate" type="date" />
            </Field>
            <Field label="Image URL">
              <Input name="imageUrl" placeholder="https://… (upload via the image button where available)" />
            </Field>
            <Field label="Credential URL">
              <Input name="credentialUrl" placeholder="https://…" />
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
            No certificates yet. Add your first certificate above.
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
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={toggleCertificatePublish}
                className={item.isPublished ? "text-success" : "text-muted"}
              >
                {item.isPublished ? "Published" : "Draft"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <Input name="title" defaultValue={item.title} required />
              </Field>
              <Field label="Issuer">
                <Input name="issuer" defaultValue={item.issuer} required />
              </Field>
              <Field label="Issue date">
                <Input name="issueDate" type="date" defaultValue={toDateInput(item.issueDate)} />
              </Field>
              <Field label="Image URL">
                <Input name="imageUrl" defaultValue={item.imageUrl ?? ""} />
              </Field>
              <Field label="Credential URL">
                <Input name="credentialUrl" defaultValue={item.credentialUrl ?? ""} />
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
              <Button type="submit" size="sm" variant="ghost" formAction={moveCertificate} name="direction" value="up" aria-label="Move up">
                ↑
              </Button>
              <Button type="submit" size="sm" variant="ghost" formAction={moveCertificate} name="direction" value="down" aria-label="Move down">
                ↓
              </Button>
              <div className="flex-1" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                formAction={deleteCertificate}
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
