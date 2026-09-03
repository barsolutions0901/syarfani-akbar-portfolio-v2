"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { educationSchema } from "@/lib/validations/cms";

function toDate(value: string | undefined): Date | null {
  return value ? new Date(value) : null;
}

export async function createEducation(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = educationSchema.safeParse({
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    fieldOfStudy: formData.get("fieldOfStudy"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    gpa: formData.get("gpa"),
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
    await prisma.education.create({
      data: {
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate,
        endDate: toDate(data.endDate),
        gpa: data.gpa,
        description: data.description,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not save this education entry." };
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/education");
  return { success: true };
}

export async function updateEducation(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = educationSchema.safeParse({
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    fieldOfStudy: formData.get("fieldOfStudy"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    gpa: formData.get("gpa"),
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
    await prisma.education.update({
      where: { id },
      data: {
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate,
        endDate: toDate(data.endDate),
        gpa: data.gpa,
        description: data.description,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not update this education entry." };
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/education");
  return { success: true };
}

export async function deleteEducation(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.education.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/education");
}

export async function toggleEducationPublish(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";

  await prisma.education.update({
    where: { id },
    data: { isPublished: !current },
  });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/education");
}

export async function moveEducation(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  const items = await prisma.education.findMany({
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
    prisma.education.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.education.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/education");
}
