import { z } from "zod";

/** Login uses institutional ID (student / employee), not public signup. */
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Enter your Student ID or Employee ID")
    .max(64),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;
