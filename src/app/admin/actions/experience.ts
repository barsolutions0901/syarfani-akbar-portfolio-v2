"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { experienceSchema } from "@/lib/validations/cms";

function toDate(value: string | undefined): Date | null {
  return value ? new Date(value) : null;
}

export async function createExperience(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = experienceSchema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    current: formData.get("current") === "on",
    description: formData.get("description"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const startDate = toDate(data.startDate);
  if (!startDate) return { error: "Start date is required" };

  try {
    await prisma.experience.create({
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        startDate,
        endDate: toDate(data.endDate),
        current: data.current,
        description: data.description,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not save this experience entry." };
  }

  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/admin/experience");
  return { success: true };
}

export async function updateExperience(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;

  const parsed = experienceSchema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    current: formData.get("current") === "on",
    description: formData.get("description"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const startDate = toDate(data.startDate);
  if (!startDate) return { error: "Start date is required" };

  try {
    await prisma.experience.update({
      where: { id },
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        startDate,
        endDate: toDate(data.endDate),
        current: data.current,
        description: data.description,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not update this experience entry." };
  }

  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/admin/experience");
  return { success: true };
}

export async function deleteExperience(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.experience.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/admin/experience");
}

export async function toggleExperiencePublish(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";

  await prisma.experience.update({
    where: { id },
    data: { isPublished: !current },
  });
  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/admin/experience");
}

export async function moveExperience(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  const items = await prisma.experience.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
    select: { id: true, order: true },
  });

  const index = items.findIndex((x) => x.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const a = items[index];
  const b = items[swapIndex];
  await prisma.$transaction([
    prisma.experience.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.experience.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/experience");
  revalidatePath("/admin/experience");
}
