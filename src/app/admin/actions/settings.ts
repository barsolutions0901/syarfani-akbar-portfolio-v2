"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { settingSchema } from "@/lib/validations/cms";

export async function createSetting(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = settingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const existing = await prisma.siteSetting.findUnique({
    where: { key: data.key },
    select: { id: true },
  });
  if (existing) return { error: "A setting with this key already exists." };

  try {
    await prisma.siteSetting.create({ data });
  } catch {
    return { error: "Could not save this setting." };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateSetting(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = settingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const current = await prisma.siteSetting.findUnique({
    where: { id },
    select: { key: true },
  });
  if (!current) return { error: "Setting not found." };

  if (current.key !== data.key) {
    const dup = await prisma.siteSetting.findUnique({
      where: { key: data.key },
      select: { id: true },
    });
    if (dup) return { error: "A setting with this key already exists." };
  }

  try {
    await prisma.siteSetting.update({
      where: { id },
      data: { key: data.key, value: data.value },
    });
  } catch {
    return { error: "Could not update this setting." };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteSetting(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.siteSetting.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
