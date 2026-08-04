import { RoleDashboardLayout } from "@/components/layout/role-dashboard-layout";

export default function PlacementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleDashboardLayout role="placement">{children}</RoleDashboardLayout>
  );
}
