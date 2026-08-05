import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDepartmentDetails } from "@/features/hod/actions";
import { HodDepartmentClient } from "./client";

export default async function HodDepartmentPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "hod") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: hodFaculty } = await (supabase as any)
    .from("faculty")
    .select("department_id")
    .eq("profile_id", profile.id)
    .single();

  if (!(hodFaculty as any)?.department_id) {
    return <div className="p-8 text-muted-foreground">No department assigned to HOD profile.</div>;
  }

  const department = await getDepartmentDetails((hodFaculty as any).department_id) as any;

  if (!department) {
    return <div className="p-8 text-muted-foreground">Failed to load department details.</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Department Structure</h2>
          <p className="text-muted-foreground mt-1">
            Structural setup, programs, sections, and class timetables for {department.name}.
          </p>
        </div>
      </div>

      <HodDepartmentClient department={department} />
    </div>
  );
}
