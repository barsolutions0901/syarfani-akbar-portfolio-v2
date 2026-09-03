import { z } from "zod";

import { optionalText, optionalUrlSchema, requiredText } from "./shared";

export const experienceSchema = z.object({
  title: requiredText,
  company: requiredText,
  location: optionalText,
  startDate: z.string().min(1, "Start date is required"),
  endDate: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  current: z.boolean().optional().default(false),
  description: optionalText,
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().optional().default(false),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  institution: requiredText,
  degree: requiredText,
  fieldOfStudy: optionalText,
  startDate: z.string().min(1, "Start date is required"),
  endDate: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  gpa: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: optionalText,
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().optional().default(false),
});

export type EducationInput = z.infer<typeof educationSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  level: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().optional().default(false),
});

export type SkillInput = z.infer<typeof skillSchema>;

export const certificateSchema = z.object({
  title: requiredText,
  issuer: requiredText,
  issueDate: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  credentialUrl: optionalUrlSchema,
  imageUrl: optionalUrlSchema,
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().optional().default(false),
});

export type CertificateInput = z.infer<typeof certificateSchema>;

export const settingSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Key may only contain letters, numbers, dots, dashes, and underscores",
    ),
  value: z.string().max(5000),
});

export type SettingInput = z.infer<typeof settingSchema>;
