"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { socialLinkSchema } from "@/lib/validations/technology";

export async function createSocialLink(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = socialLinkSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.socialLink.create({ data: parsed.data });

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true };
}

export async function updateSocialLink(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = socialLinkSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.socialLink.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true };
}

export async function deleteSocialLink(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.socialLink.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/profile");
}