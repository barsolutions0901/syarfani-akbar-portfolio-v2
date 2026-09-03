"use client";

import { useActionState, useState } from "react";

import { initialState } from "@/lib/actions";
import { ImageUpload } from "@/components/upload/image-upload";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/admin/actions/profile";
import type { Profile } from "@/generated/prisma/client";

type ProfileFormProps = {
  profile: Profile | null;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? "");
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl ?? "");

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" defaultValue={profile?.name ?? ""} required />
        </Field>
        <Field label="Headline / role">
          <Input name="title" defaultValue={profile?.title ?? ""} required />
        </Field>
      </div>

      <Field label="Bio">
        <Textarea name="bio" defaultValue={profile?.bio ?? ""} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Location">
          <Input name="location" defaultValue={profile?.location ?? ""} />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" defaultValue={profile?.email ?? ""} />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={profile?.phone ?? ""} />
        </Field>
        <Field label="WhatsApp number">
          <Input name="whatsapp" defaultValue={profile?.whatsapp ?? ""} />
        </Field>
        <Field label="Availability status" hint="e.g. Open to work, Busy">
          <Input name="availability" defaultValue={profile?.availability ?? ""} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Profile image">
          <ImageUpload
            kind="image"
            value={photoUrl}
            onChange={setPhotoUrl}
          />
          <input type="hidden" name="photoUrl" value={photoUrl} />
        </Field>
        <Field label="Resume / CV">
          <ImageUpload
            kind="resume"
            value={resumeUrl}
            onChange={setResumeUrl}
          />
          <input type="hidden" name="resumeUrl" value={resumeUrl} />
        </Field>
      </div>

      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/5 px-3.5 py-2.5 text-sm text-success">
          Profile saved.
        </p>
      )}

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}