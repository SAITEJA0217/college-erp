"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateNotificationPreferences(userId: string, preferences: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("profiles")
    .update({ notification_preferences: preferences })
    .eq("id", userId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/", "layout");
  return { success: true };
}
