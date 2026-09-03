"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { certificateSchema } from "@/lib/validations/cms";

function toDate(value: string | undefined): Date | null {
  return value ? new Date(value) : null;
}

export async function createCertificate(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = certificateSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer"),
    issueDate: formData.get("issueDate"),
    credentialUrl: formData.get("credentialUrl"),
    imageUrl: formData.get("imageUrl"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  try {
    await prisma.certificate.create({
      data: {
        title: data.title,
        issuer: data.issuer,
        issueDate: toDate(data.issueDate),
        credentialUrl: data.credentialUrl,
        imageUrl: data.imageUrl,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not save this certificate." };
  }

  revalidatePath("/");
  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
  return { success: true };
}

export async function updateCertificate(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = certificateSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer"),
    issueDate: formData.get("issueDate"),
    credentialUrl: formData.get("credentialUrl"),
    imageUrl: formData.get("imageUrl"),
    order: formData.get("order") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  try {
    await prisma.certificate.update({
      where: { id },
      data: {
        title: data.title,
        issuer: data.issuer,
        issueDate: toDate(data.issueDate),
        credentialUrl: data.credentialUrl,
        imageUrl: data.imageUrl,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
  } catch {
    return { error: "Could not update this certificate." };
  }

  revalidatePath("/");
  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
  return { success: true };
}

export async function deleteCertificate(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
}

export async function toggleCertificatePublish(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";

  await prisma.certificate.update({
    where: { id },
    data: { isPublished: !current },
  });
  revalidatePath("/");
  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
}

export async function moveCertificate(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  const items = await prisma.certificate.findMany({
    orderBy: [{ order: "asc" }, { issueDate: "desc" }],
    select: { id: true, order: true },
  });

  const index = items.findIndex((x) => x.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const a = items[index];
  const b = items[swapIndex];
  await prisma.$transaction([
    prisma.certificate.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.certificate.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
}
