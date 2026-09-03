"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { technologySchema } from "@/lib/validations/technology";

export async function createTechnology(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = technologySchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.technology.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "A technology with this name already exists." };
  }

  await prisma.technology.create({ data: { name: parsed.data.name } });

  revalidatePath("/admin/technologies");
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function updateTechnology(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = technologySchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.technology.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/admin/technologies");
  return { success: true };
}

export async function deleteTechnology(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const used = await prisma.technology.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });

  if (used && used._count.projects > 0) {
    return;
  }

  await prisma.technology.delete({ where: { id } });

  revalidatePath("/admin/technologies");
  revalidatePath("/admin/projects");
}