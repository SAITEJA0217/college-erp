"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const preferencesInputSchema = z.object({
  userId: z.string().uuid("Invalid user reference"),
  preferences: z.record(z.string(), z.any()),
});

export async function updateNotificationPreferences(userId: string, preferences: Record<string, unknown>) {
  try {
    const profile = await assertRole(["admin", "faculty", "student", "hod", "placement"]);
    const validated = preferencesInputSchema.parse({ userId, preferences });

    if (profile.id !== validated.userId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ notification_preferences: validated.preferences })
      .eq("id", validated.userId);
      
    if (error) throw error;
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update preferences" };
  }
}
