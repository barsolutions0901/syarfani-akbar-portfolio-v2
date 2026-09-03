import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal("").transform(() => undefined))
  .refine(
    (v) => v === undefined || /^https?:\/\/.+/i.test(v),
    { message: "Must be a valid http(s) URL" },
  );

export const optionalText = z
  .string()
  .trim()
  .max(10000)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const requiredText = z.string().trim().min(1).max(10000);