import { z } from "zod";

import { optionalText, optionalUrlSchema, requiredText, slugSchema } from "./shared";

export const projectSchema = z.object({
  title: requiredText,
  slug: slugSchema,
  category: optionalText,
  client: optionalText,
  shortDescription: requiredText,
  description: optionalText,
  overview: optionalText,
  role: optionalText,
  status: optionalText,
  startDate: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  endDate: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  features: optionalText,
  challenges: optionalText,
  solutions: optionalText,
  results: optionalText,
  architecture: optionalText,
  liveUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,
  order: z.coerce.number().int().min(0).default(0),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  thumbnailUrl: optionalUrlSchema,
  technologyIds: z.array(z.string()).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;