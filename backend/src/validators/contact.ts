import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(300).optional(),
  message: z.string().trim().min(1).max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
