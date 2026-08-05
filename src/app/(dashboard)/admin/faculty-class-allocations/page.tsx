import { Suspense } from "react";
import { getFacultyAssignments } from "@/features/admin/allocation-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { AllocationsClient } from "./allocations-client";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Faculty Class Allocation | Admin Portal",
  description: "Assign faculty members to subjects, sections, semesters, and academic years.",
};

async function getFormData() {
  const adminClient = createAdminClient();
  
  const [
    { data: facultyData },
    { data: departments },
    { data: semesters },
    { data: sections },
    { data: subjects }
  ] = await Promise.all([
    adminClient.from("profiles").select("id, full_name, employee_or_student_id").eq("role", "faculty").eq("is_archived", false),
    adminClient.from("departments").select("id, name, code").eq("is_archived", false),
    adminClient.from("semesters").select("id, semester_number, program_id, program:programs(name, department_id)").eq("is_archived", false),
    adminClient.from("sections").select("id, name, semester_id, semester:semesters(program:programs(department_id))").eq("is_archived", false),
    adminClient.from("subjects").select("id, name, code, section_id, section:sections(semester:semesters(program:programs(department_id)))").eq("is_archived", false)
  ]);

  return {
    faculty: facultyData || [],
    departments: departments || [],
    semesters: semesters || [],
    sections: sections || [],
    subjects: subjects || []
  };
}

export default async function FacultyClassAllocationsPage() {
  const [{ data: assignments }, formData] = await Promise.all([
    getFacultyAssignments(),
    getFormData()
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Faculty Class Allocation</h1>
        <p className="text-muted-foreground">Assign faculty members to subjects, sections, semesters, and academic years.</p>
      </div>
      
      <Suspense fallback={
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      }>
        <AllocationsClient initialData={assignments as any} formData={formData as any} />
      </Suspense>
    </div>
  );
}
