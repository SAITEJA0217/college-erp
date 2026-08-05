"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRole } from "@/features/auth/user";

export async function getStudentDashboardData() {
  try {
    const profile = await assertRole(["student"]);
    const supabase = await createClient();

    // Get the student's section_id
    const { data, error: sErr } = await (supabase as any)
      .from("students")
      .select("section_id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    const studentData = data as any;
    if (sErr || !studentData?.section_id) throw new Error("Student data not found");

    const sectionId = studentData.section_id;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // 1. Fetch today's classes from faculty_class_assignments
    const { data: classes } = await (supabase as any)
      .from("faculty_class_assignments")
      .select(`
        id, room_number, start_time, end_time, day_of_week,
        subject:subjects(name)
      `)
      .eq("section_id", sectionId)
      .eq("day_of_week", today)
      .eq("is_archived", false)
      .order("start_time");

    const todayClasses = (classes || []).map((c: any) => ({
      time: `${c.start_time.substring(0, 5)} - ${c.end_time.substring(0, 5)}`,
      subject: c.subject?.name,
      room: c.room_number,
    }));

    // 2. Attendance
    const { data: attData } = await (supabase as any)
      .from("attendance_records")
      .select("status")
      .eq("student_id", profile.id);

    let present = 0;
    let totalAtt = 0;
    attData?.forEach((r: any) => {
      totalAtt++;
      if (r.status === "present") present++;
    });
    const attendance = totalAtt === 0 ? 0 : Math.round((present / totalAtt) * 100);

    // 3. Pending Assignments
    const { data: pending } = await (supabase as any)
      .from("assignments")
      .select("id, title, due_date")
      .eq("section_id", sectionId)
      .eq("is_archived", false)
      .gte("due_date", new Date().toISOString())
      .order("due_date")
      .limit(3);

    const pendingAssignments = (pending || []).map((a: any) => ({
      title: a.title,
      due: new Date(a.due_date).toLocaleDateString(),
    }));

    return {
      todayClasses,
      attendance,
      pendingAssignments,
      upcomingQuiz: null, // mock or implement later
    };

  } catch (err) {
    console.error("Student dashboard error:", err);
    return {
      todayClasses: [],
      attendance: 0,
      pendingAssignments: [],
      upcomingQuiz: null
    };
  }
}
