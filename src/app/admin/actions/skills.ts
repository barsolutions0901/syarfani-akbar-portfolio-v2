"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { skillSchema } from "@/lib/validations/cms";

export async function createSkill(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    level: formData.get("level"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const existing = await prisma.skill.findFirst({
    where: { name: data.name },
    select: { id: true },
  });
  if (existing) return { error: "A skill with this name already exists." };

  try {
    await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category,
        level: data.level,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not save this skill." };
  }

  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return { success: true };
}

export async function updateSkill(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    level: formData.get("level"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const dup = await prisma.skill.findFirst({
    where: { name: data.name, NOT: { id } },
    select: { id: true },
  });
  if (dup) return { error: "Another skill already uses this name." };

  try {
    await prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        level: data.level,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not update this skill." };
  }

  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return { success: true };
}

export async function deleteSkill(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.skill.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
}

export async function toggleSkillPublish(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";

  await prisma.skill.update({
    where: { id },
    data: { isPublished: !current },
  });
  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
}

export async function moveSkill(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  const items = await prisma.skill.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, order: true },
  });

  const index = items.findIndex((x) => x.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const a = items[index];
  const b = items[swapIndex];
  await prisma.$transaction([
    prisma.skill.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.skill.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
}
