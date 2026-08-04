"use server";

import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/database";

export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return { data: data as Notification[] | null, error };
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return { count: count ?? 0, error };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  return { success: !error, error };
}

export async function markAllAsRead(userId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return { success: !error, error };
}

export async function sendNotification({
  userIds,
  title,
  body,
  category,
  link,
}: {
  userIds: string[];
  title: string;
  body: string;
  category: "academic" | "placement" | "general" | "emergency";
  link?: string;
}) {
  if (userIds.length === 0) return { success: true };

  const supabase = await createClient();
  const payloads = userIds.map((id) => ({
    user_id: id,
    title,
    body,
    category,
    link: link ?? null,
    is_read: false,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("notifications").insert(payloads);

  return { success: !error, error };
}
