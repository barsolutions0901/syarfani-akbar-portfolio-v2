import { z } from "zod";

export const technologySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export type TechnologyInput = z.infer<typeof technologySchema>;

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => /^https?:\/\/.+/i.test(v), "Must be a valid http(s) URL"),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().optional().default(true),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;