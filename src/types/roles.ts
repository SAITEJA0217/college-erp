export const APP_ROLES = [
  "student",
  "faculty",
  "hod",
  "placement",
  "admin",
  "pending",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type DashboardRole = Exclude<AppRole, "pending">;

export const DASHBOARD_ROLES: DashboardRole[] = [
  "student",
  "faculty",
  "hod",
  "placement",
  "admin",
];

export function isDashboardRole(role: string): role is DashboardRole {
  return DASHBOARD_ROLES.includes(role as DashboardRole);
}
