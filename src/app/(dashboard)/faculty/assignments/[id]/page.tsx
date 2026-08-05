import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignmentGradingClient } from "./client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GradingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const profile = await getUserProfile();
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  const supabase = await createClient();
  
  // Fetch assignment details
  const { data: assignment, error: assignErr } = await (supabase as any)
    .from("assignments")
    .select(`
      id,
      title,
      max_marks,
      deadline,
      subject_id,
      subjects (
        name,
        code
      )
    `)
    .eq("id", resolvedParams.id)
    .single();

  if (assignErr || !assignment) {
    return <div className="p-8">Assignment not found</div>;
  }

  // Fetch all students enrolled in this subject's section
  // 1. We need to find the sections this faculty teaches for this subject
  const { data: facAssignments } = await (supabase as any)
    .from("faculty_assignments")
    .select("section_id")
    .eq("faculty_id", profile.id)
    .eq("subject_id", assignment.subject_id);

  const sectionIds = facAssignments?.map((f: any) => f.section_id) || [];

  // 2. Find students in these sections
  const { data: students } = await (supabase as any)
    .from("students")
    .select(`
      profile_id,
      roll_number,
      profiles (
        full_name
      )
    `)
    .in("section_id", sectionIds);

  // 3. Fetch submissions for this assignment
  const { data: submissions } = await (supabase as any)
    .from("assignment_submissions")
    .select(`
      id,
      student_id,
      file_url,
      submitted_at,
      marks_obtained,
      feedback
    `)
    .eq("assignment_id", resolvedParams.id);

  // 4. Map them together
  const gradingData = (students || []).map((student: any) => {
    const sub = submissions?.find((s: any) => s.student_id === student.profile_id);
    return {
      student_id: student.profile_id,
      student_name: student.profiles?.full_name || "Unknown",
      enrollment_number: student.roll_number,
      submission_id: sub?.id || null,
      file_url: sub?.file_url || null,
      submitted_at: sub?.submitted_at || null,
      marks_obtained: sub?.marks_obtained ?? null,
      feedback: sub?.feedback || ""
    };
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/faculty/assignments">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Grade Submissions</h1>
          <p className="text-muted-foreground text-sm">
            {assignment.title} ({assignment.subjects?.code}) - Max Marks: {assignment.max_marks}
          </p>
        </div>
      </div>

      <AssignmentGradingClient 
        assignment={assignment} 
        gradingData={gradingData} 
      />
    </div>
  );
}
