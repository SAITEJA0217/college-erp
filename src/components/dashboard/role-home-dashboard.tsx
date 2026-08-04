import {
  Bell,
  Briefcase,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  DashboardCard,
  SectionHeader,
  StatCard,
} from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ROLE_LABELS } from "@/config/navigation";
import type { DashboardRole } from "@/types/roles";

const analyticsByRole: Record<
  DashboardRole,
  Array<{ title: string; value: string; description: string; icon: typeof Users }>
> = {
  student: [
    { title: "Attendance", value: "—", description: "Today's status", icon: ClipboardCheck },
    { title: "Assignments", value: "—", description: "Pending submissions", icon: FileText },
    { title: "Notifications", value: "0", description: "Unread", icon: Bell },
    { title: "Credits", value: "—", description: "Current semester", icon: GraduationCap },
  ],
  faculty: [
    { title: "Classes", value: "—", description: "Active offerings", icon: GraduationCap },
    { title: "Attendance", value: "—", description: "Sessions today", icon: ClipboardCheck },
    { title: "Assignments", value: "—", description: "Awaiting review", icon: FileText },
    { title: "Notifications", value: "0", description: "Unread", icon: Bell },
  ],
  hod: [
    { title: "Students", value: "—", description: "Department total", icon: GraduationCap },
    { title: "Faculty", value: "—", description: "Active members", icon: Users },
    { title: "Attendance", value: "—", description: "Today average", icon: ClipboardCheck },
    { title: "Notifications", value: "0", description: "Unread", icon: Bell },
  ],
  placement: [
    { title: "Drives", value: "—", description: "Active this month", icon: Briefcase },
    { title: "Applications", value: "—", description: "In pipeline", icon: FileText },
    { title: "Placement %", value: "—", description: "Current batch", icon: GraduationCap },
    { title: "Notifications", value: "0", description: "Unread", icon: Bell },
  ],
  admin: [
    { title: "Total Students", value: "—", description: "Active enrollments", icon: GraduationCap },
    { title: "Faculty Count", value: "—", description: "Active staff", icon: Users },
    { title: "Today's Attendance", value: "—", description: "Campus average", icon: ClipboardCheck },
    { title: "Placement %", value: "—", description: "Latest batch", icon: Briefcase },
  ],
};

export function RoleHomeDashboard({ role }: { role: DashboardRole }) {
  const stats = analyticsByRole[role];

  return (
    <div>
      <SectionHeader
        title={`${ROLE_LABELS[role]} Dashboard`}
        description="Foundation shell is ready. Domain modules will populate these analytics next."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard
          title="Recent activity"
          description="Live feeds connect after operational modules ship."
        >
          <EmptyState
            title="No activity yet"
            description="Attendance, assignments, and placement events will appear here."
            className="border-0 bg-transparent p-4 shadow-none"
          />
        </DashboardCard>
        <DashboardCard
          title="Quick links"
          description="Role navigation is available in the sidebar."
        >
          <EmptyState
            title="Modules staged"
            description="Feature routes are reserved. Implementation starts after foundation sign-off."
            className="border-0 bg-transparent p-4 shadow-none"
          />
        </DashboardCard>
      </div>
    </div>
  );
}
