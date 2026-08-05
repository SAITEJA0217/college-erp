"use server";

import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/database";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const sendNotificationSchema = z.object({
  userIds: z.array(z.string().uuid("Invalid user reference")),
  title: z.string().trim().min(1, "Title is required").max(100),
  body: z.string().trim().min(1, "Body is required").max(500),
  category: z.enum(["academic", "placement", "general", "emergency"]),
  link: z.string().trim().optional().nullable(),
});

export async function getNotifications(userId: string) {
  try {
    const profile = await assertRole(["admin", "faculty", "student", "hod", "placement"]);
    z.string().uuid().parse(userId);

    if (profile.id !== userId) {
      return { data: [], error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data: data as Notification[] | null, error: null };
  } catch (e: any) {
    return { data: [], error: e.message || "Failed to load notifications" };
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const profile = await assertRole(["admin", "faculty", "student", "hod", "placement"]);
    z.string().uuid().parse(userId);

    if (profile.id !== userId) {
      return { count: 0, error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return { count: count ?? 0, error: null };
  } catch (e: any) {
    return { count: 0, error: e.message || "Failed to load notification count" };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const profile = await assertRole(["admin", "faculty", "student", "hod", "placement"]);
    z.string().uuid().parse(notificationId);

    const supabase = await createClient();

    // Verify ownership
    const { data: existing } = await (supabase as any)
      .from("notifications")
      .select("user_id")
      .eq("id", notificationId)
      .single();

    if (!existing || existing.user_id !== profile.id) {
      return { success: false, error: "Forbidden: Notification ownership mismatch." };
    }

    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark notification read" };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    const profile = await assertRole(["admin", "faculty", "student", "hod", "placement"]);
    z.string().uuid().parse(userId);

    if (profile.id !== userId) {
      return { success: false, error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark all notifications read" };
  }
}

export async function sendNotification(params: {
  userIds: string[];
  title: string;
  body: string;
  category: "academic" | "placement" | "general" | "emergency";
  link?: string;
}) {
  try {
    await assertRole(["admin", "faculty", "hod", "placement"]);
    const validated = sendNotificationSchema.parse(params);

    if (validated.userIds.length === 0) return { success: true };

    const supabase = await createClient();
    const payloads = validated.userIds.map((id) => ({
      user_id: id,
      title: validated.title,
      body: validated.body,
      category: validated.category,
      link: validated.link ?? null,
      is_read: false,
    }));

    const { error } = await (supabase as any).from("notifications").insert(payloads);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send notifications" };
  }
}
