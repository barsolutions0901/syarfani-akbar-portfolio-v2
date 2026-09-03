"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations/profile";

export async function updateProfile(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    bio: formData.get("bio"),
    photoUrl: formData.get("photoUrl"),
    resumeUrl: formData.get("resumeUrl"),
    location: formData.get("location"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    availability: formData.get("availability"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  await prisma.profile.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  revalidatePath("/");
  return { success: true };
}