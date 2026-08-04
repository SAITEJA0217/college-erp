import { RoleDashboardLayout } from "@/components/layout/role-dashboard-layout";

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardLayout role="faculty">{children}</RoleDashboardLayout>;
}
