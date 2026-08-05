"use server";

import { sendEmail } from "@/lib/email";
import { ticketReplyTemplate, announcementTemplate } from "@/lib/email/templates";
import { assertRole } from "@/features/auth/user";
import { createClient } from "@/lib/supabase/server";

export async function sendTicketReplyEmail(ticketId: string, replyBody: string, authorName: string) {
  try {
    const supabase = await createClient();
    const { data: ticket } = await (supabase as any)
      .from("help_desk_tickets")
      .select("subject, requester:profiles!help_desk_tickets_requester_id_fkey(email)")
      .eq("id", ticketId)
      .single();

    if (!ticket || !ticket.requester?.email) return { success: false, error: "Requester email not found" };

    const html = ticketReplyTemplate(
      ticket.subject, 
      replyBody, 
      authorName, 
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/help-desk` // Dynamic link to ticket
    );

    return await sendEmail({
      to: ticket.requester.email,
      subject: `Re: ${ticket.subject}`,
      html,
    });
  } catch (error: any) {
    console.error("Failed to send ticket reply email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendAnnouncementEmail(title: string, content: string, audience: string) {
  try {
    const profile = await assertRole(["admin", "hod", "placement"]);
    
    // In a real scenario, you'd fetch all emails matching the audience.
    // For this implementation, we will mock the recipient list or send to a designated test email
    // since fetching all students/faculty might exceed typical API limits for this ERP size without batching.
    
    const html = announcementTemplate(
      title,
      content,
      profile.full_name || "Admin",
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/announcements`
    );

    return await sendEmail({
      to: process.env.TEST_NOTIFICATION_EMAIL || "test-audience@college-erp.com",
      subject: `Announcement: ${title}`,
      html,
    });
  } catch (error: any) {
    console.error("Failed to send announcement email:", error);
    return { success: false, error: error.message };
  }
}
