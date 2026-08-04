export const siteConfig = {
  name: "Nexus University",
  shortName: "Nexus ERP",
  description:
    "Premium college ERP for academics, attendance, placements, and campus operations.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
