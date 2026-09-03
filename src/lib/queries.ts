import "server-only";

import { prisma } from "@/lib/db";

/** Fetch the public profile (single row, id "default"). Returns null if empty. */
export async function getPublicProfile() {
  return prisma.profile.findUnique({ where: { id: "default" } });
}

/** Published, non-deleted projects ordered by CMS ordering. */
export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      technologies: { orderBy: { name: "asc" } },
    },
  });
}

/** A single published project by slug (or null). */
export async function getPublishedProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      technologies: { orderBy: { name: "asc" } },
    },
  });
}

/** A single project by slug regardless of publish state (for SEO metadata). */
export async function getProjectMetaBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug },
    select: { title: true, shortDescription: true },
  });
}

export async function getPublishedExperience() {
  return prisma.experience.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
}

export async function getPublishedEducation() {
  return prisma.education.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
}

export async function getPublishedSkills() {
  return prisma.skill.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
}

export async function getPublishedCertificates() {
  return prisma.certificate.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { issueDate: "desc" }],
  });
}

/** Published social links for the footer / contact. */
export async function getPublishedSocialLinks() {
  return prisma.socialLink.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });
}
