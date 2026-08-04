"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/features/auth/user";

export async function getStudentAttendanceAnalytics() {
  try {
    const profile = await getUserProfile();
    if (!profile || profile.role !== "student") {
      return { error: "Unauthorized" };
    }

    const supabase = await createClient();

    // Fetch all attendance records for this student
    const { data: records, error } = await (supabase as any)
      .from("attendance_records")
      .select(`
        status,
        attendance (
          date,
          subject_id,
          subjects (
            name,
            code
          )
        )
      `)
      .eq("student_id", profile.id)
      .order("attendance(date)", { ascending: false });

    if (error) {
      console.error("Error fetching student attendance:", error);
      return { error: error.message };
    }

    // Process analytics
    let totalClasses = 0;
    let presentClasses = 0;
    let lateClasses = 0;
    let absentClasses = 0;

    const subjectStats: Record<string, { subject: string; code: string; total: number; present: number; absent: number; late: number }> = {};
    const recentLogs: any[] = [];

    records.forEach((record: any, index: number) => {
      const subjectId = record.attendance.subject_id;
      const subjectName = record.attendance.subjects.name;
      const subjectCode = record.attendance.subjects.code;
      const status = record.status;
      const date = record.attendance.date;

      totalClasses++;
      if (status === "present") presentClasses++;
      if (status === "late") lateClasses++;
      if (status === "absent") absentClasses++;

      // Subject stats
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = { subject: subjectName, code: subjectCode, total: 0, present: 0, absent: 0, late: 0 };
      }
      subjectStats[subjectId].total++;
      if (status === "present") subjectStats[subjectId].present++;
      if (status === "late") subjectStats[subjectId].late++;
      if (status === "absent") subjectStats[subjectId].absent++;

      // Top 5 recent logs
      if (index < 5) {
        recentLogs.push({
          date,
          subject: subjectName,
          status,
        });
      }
    });

    const overallPercentage = totalClasses === 0 ? 100 : Math.round(((presentClasses + lateClasses) / totalClasses) * 100);

    const subjectBreakdown = Object.values(subjectStats).map((s) => ({
      ...s,
      percentage: s.total === 0 ? 100 : Math.round(((s.present + s.late) / s.total) * 100),
    }));

    return {
      data: {
        summary: { totalClasses, presentClasses, lateClasses, absentClasses, overallPercentage },
        subjectBreakdown,
        recentLogs,
      }
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch analytics" };
  }
}
