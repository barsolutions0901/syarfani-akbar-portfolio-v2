"use server";

import { revalidatePath } from "next/cache";

import { type ActionState } from "@/lib/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils/slug";
import { projectSchema } from "@/lib/validations/project";

async function saveProject(
  state: ActionState,
  id: string | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    client: formData.get("client"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    overview: formData.get("overview"),
    role: formData.get("role"),
    status: formData.get("status"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    features: formData.get("features"),
    challenges: formData.get("challenges"),
    solutions: formData.get("solutions"),
    results: formData.get("results"),
    architecture: formData.get("architecture"),
    liveUrl: formData.get("liveUrl"),
    githubUrl: formData.get("githubUrl"),
    order: formData.get("order"),
    isFeatured: formData.get("isFeatured") === "on",
    isPublished: formData.get("isPublished") === "on",
    thumbnailUrl: formData.get("thumbnailUrl"),
    technologyIds: formData.getAll("technologyIds"),
  };

  const galleryRaw = String(formData.get("galleryUrls") ?? "[]");
  let galleryUrls: string[] = [];
  try {
    galleryUrls = JSON.parse(galleryRaw) as string[];
  } catch {
    galleryUrls = [];
  }
  const galleryUrlsClean = galleryUrls.filter((u) => typeof u === "string" && u.length > 0);

  // Auto-slug from title when the slug field is empty
  if (!raw.slug) {
    raw.slug = slugify(String(raw.title ?? ""));
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);

  // Unique slug handling
  const existingSlug = await prisma.project.findUnique({ where: { slug } });
  if (existingSlug && existingSlug.id !== id) {
    return { error: "A project with this slug already exists." };
  }

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  const base = {
    title: data.title,
    slug,
    category: data.category,
    client: data.client,
    shortDescription: data.shortDescription,
    description: data.description,
    overview: data.overview,
    role: data.role,
    status: data.status,
    startDate,
    endDate,
    features: data.features,
    challenges: data.challenges,
    solutions: data.solutions,
    results: data.results,
    architecture: data.architecture,
    liveUrl: data.liveUrl,
    githubUrl: data.githubUrl,
    order: data.order,
    isFeatured: data.isFeatured,
    isPublished: data.isPublished,
    publishedAt: data.isPublished ? new Date() : null,
  };

  // Replace technologies relation
  const connectTech = data.technologyIds
    .filter(Boolean)
    .map((t) => ({ id: t }));

  // Thumbnail image handling
  const thumbnailTouched = formData.get("thumbnailTouched") === "true";

  const project = id
    ? await prisma.project.update({
        where: { id },
        data: {
          ...base,
          technologies: { set: connectTech },
        },
      })
    : await prisma.project.create({
        data: {
          ...base,
          technologies: { connect: connectTech },
        },
      });

  // Manage thumbnail image (ProjectImage with isThumbnail)
  if (data.thumbnailUrl) {
    const existingThumb = await prisma.projectImage.findFirst({
      where: { projectId: project.id, isThumbnail: true },
    });
    if (existingThumb) {
      await prisma.projectImage.update({
        where: { id: existingThumb.id },
        data: { url: data.thumbnailUrl },
      });
    } else {
      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          url: data.thumbnailUrl,
          isThumbnail: true,
          sortOrder: 0,
        },
      });
    }
  } else if (thumbnailTouched) {
    await prisma.projectImage.deleteMany({
      where: { projectId: project.id, isThumbnail: true },
    });
  }

  // Manage gallery images (non-thumbnail ProjectImages)
  await prisma.projectImage.deleteMany({
    where: { projectId: project.id, isThumbnail: false },
  });
  if (galleryUrlsClean.length > 0) {
    await prisma.projectImage.createMany({
      data: galleryUrlsClean.map((url, index) => ({
        projectId: project.id,
        url,
        isThumbnail: false,
        sortOrder: index,
      })),
    });
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return { success: true };
}

export async function createProject(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return saveProject(state, undefined, formData);
}

export async function updateProject(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id") as string;
  return saveProject(state, id, formData);
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}

export async function togglePublish(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";

  await prisma.project.update({
    where: { id },
    data: {
      isPublished: !current,
      publishedAt: !current ? new Date() : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";

  await prisma.project.update({
    where: { id },
    data: { isFeatured: !current },
  });

  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function moveProject(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true },
  });

  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= projects.length) return;

  const a = projects[index];
  const b = projects[swapIndex];

  await prisma.$transaction([
    prisma.project.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.project.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/projects");
}