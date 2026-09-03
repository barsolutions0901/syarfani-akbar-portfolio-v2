import type { MetadataRoute } from "next";

import { getPublishedProjects } from "@/lib/queries";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://syarfaniakbar.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();

  return [
    { url: `${SITE_ORIGIN}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_ORIGIN}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_ORIGIN}/experience`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_ORIGIN}/projects`, changeFrequency: "weekly", priority: 0.9 },
    ...projects.map((project) => ({
      url: `${SITE_ORIGIN}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_ORIGIN}/skills`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_ORIGIN}/certificates`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_ORIGIN}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
