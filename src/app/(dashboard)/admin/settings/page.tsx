import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { 
  getOrganizationSettings, 
  getHolidays, 
  getAllUsers 
} from "@/features/admin/settings-actions";
import { getAcademicYears } from "@/features/admin/academic-actions";
import { AdminSettingsClient } from "./client";

export default async function AdminSettingsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  // Load all configurations in parallel
  const [
    orgSettingsRes,
    holidaysRes,
    usersRes,
    academicYearsRes
  ] = await Promise.all([
    getOrganizationSettings(),
    getHolidays(),
    getAllUsers(),
    getAcademicYears()
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground mt-1">
            Institutional defaults, calendar holidays, and RBAC user permissions panel.
          </p>
        </div>
      </div>

      <AdminSettingsClient 
        orgSettings={orgSettingsRes.data}
        holidaysList={holidaysRes.data || []}
        usersList={usersRes.data || []}
        academicYears={academicYearsRes || []}
      />
    </div>
  );
}
