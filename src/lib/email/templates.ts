export function ticketReplyTemplate(ticketSubject: string, replyBody: string, authorName: string, ticketUrl: string) {
  return `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333;">New Reply to Your Ticket</h2>
      <p style="color: #555; font-size: 16px;">
        There is a new update on your ticket: <strong>${ticketSubject}</strong>
      </p>
      
      <div style="background-color: #f9f9f9; padding: 16px; border-left: 4px solid #0066cc; margin: 20px 0;">
        <p style="margin: 0; color: #444; white-space: pre-wrap;">${replyBody}</p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #777;">&mdash; ${authorName}</p>
      </div>
      
      <a href="${ticketUrl}" style="display: inline-block; background-color: #0066cc; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
        View Ticket
      </a>
    </div>
  `;
}

export function announcementTemplate(title: string, content: string, authorName: string, linkUrl?: string) {
  return `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333;">New Announcement: ${title}</h2>
      <p style="font-size: 14px; color: #777; margin-bottom: 20px;">
        Published by ${authorName}
      </p>
      
      <div style="color: #444; font-size: 16px; line-height: 1.5; white-space: pre-wrap;">
        ${content}
      </div>
      
      ${linkUrl ? `
        <div style="margin-top: 30px;">
          <a href="${linkUrl}" style="display: inline-block; background-color: #0066cc; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Details
          </a>
        </div>
      ` : ''}
    </div>
  `;
}
