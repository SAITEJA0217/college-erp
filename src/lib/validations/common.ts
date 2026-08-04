import { z } from "zod";

export const emailSchema = z.string().email("Enter a valid email");
export const nonEmptyString = z.string().trim().min(1, "Required");
