import { z } from "zod";

import { optionalText, optionalUrlSchema, requiredText } from "./shared";

export const profileSchema = z.object({
  name: requiredText,
  title: requiredText,
  bio: requiredText,
  photoUrl: optionalUrlSchema,
  resumeUrl: optionalUrlSchema,
  location: optionalText,
  phone: optionalText,
  email: z
    .string()
    .trim()
    .max(200)
    .email("Must be a valid email address")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  whatsapp: optionalText,
  availability: optionalText,
});

export type ProfileInput = z.infer<typeof profileSchema>;