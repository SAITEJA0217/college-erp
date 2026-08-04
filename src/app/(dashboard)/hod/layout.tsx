import { RoleDashboardLayout } from "@/components/layout/role-dashboard-layout";

export default function HodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardLayout role="hod">{children}</RoleDashboardLayout>;
}
