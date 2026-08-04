import type { AppRole } from "@/types/roles";

export type NotificationCategory =
  | "academic"
  | "placement"
  | "general"
  | "emergency";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: AppRole;
  employee_or_student_id: string | null;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  notification_preferences: {
    academic: boolean;
    placement: boolean;
    general: boolean;
    emergency: boolean;
  };
}

export interface College {
  id: string;
  code: string;
  name: string;
  is_archived: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  college_id: string | null;
  code: string;
  name: string;
  is_archived: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  department_id: string;
  code: string;
  name: string;
  is_archived: boolean;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface Semester {
  id: string;
  academic_year_id: string;
  program_id: string;
  semester_number: number;
  start_date: string | null;
  end_date: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface Section {
  id: string;
  semester_id: string;
  name: string;
  is_archived: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  section_id: string;
  code: string;
  name: string;
  credits: number;
  is_archived: boolean;
  created_at: string;
}

export interface Student {
  profile_id: string;
  roll_number: string;
  department_id: string | null;
  semester_id: string | null;
  section_id: string | null;
  batch_year: number;
  current_cgpa: number;
}

export interface Faculty {
  profile_id: string;
  department_id: string | null;
  designation: string | null;
}

export interface FacultyAssignment {
  id: string;
  subject_id: string;
  faculty_id: string;
  is_archived: boolean;
  created_at: string;
}

export interface Timetable {
  id: string;
  section_id: string;
  subject_id: string;
  faculty_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  section_id: string;
  subject_id: string;
  date: string;
  faculty_id: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  attendance_id: string;
  student_id: string;
  status: "present" | "absent" | "late";
}

export interface Assignment {
  id: string;
  subject_id: string;
  faculty_id: string;
  title: string;
  description: string | null;
  deadline: string;
  max_marks: number;
  file_url: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  submitted_at: string;
  marks_obtained: number | null;
  feedback: string | null;
}

export interface Note {
  id: string;
  subject_id: string;
  faculty_id: string;
  title: string;
  description: string | null;
  unit: string | null;
  resource_type: "pdf" | "ppt" | "docx" | "zip" | "image" | "link" | "youtube";
  url: string;
  is_archived: boolean;
  created_at: string;
}

export interface Placement {
  id: string;
  company_name: string;
  job_role: string;
  ctc: string | null;
  application_deadline: string;
  description: string | null;
  placement_type: "internship" | "full-time";
  eligibility_cgpa: number;
  locations: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface PlacementApplication {
  id: string;
  placement_id: string;
  student_id: string;
  status: "applied" | "shortlisted" | "interviewed" | "selected" | "rejected";
  applied_at: string;
  resume_url: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  category: NotificationCategory;
  is_read: boolean;
  created_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      colleges: TableDef<College>;
      departments: TableDef<Department>;
      programs: TableDef<Program>;
      academic_years: TableDef<AcademicYear>;
      semesters: TableDef<Semester>;
      sections: TableDef<Section>;
      subjects: TableDef<Subject>;
      students: TableDef<Student>;
      faculty: TableDef<Faculty>;
      faculty_assignments: TableDef<FacultyAssignment>;
      timetables: TableDef<Timetable>;
      attendance: TableDef<Attendance>;
      attendance_records: TableDef<AttendanceRecord>;
      assignments: TableDef<Assignment>;
      assignment_submissions: TableDef<AssignmentSubmission>;
      notes: TableDef<Note>;
      placements: TableDef<Placement>;
      placement_applications: TableDef<PlacementApplication>;
      notifications: TableDef<Notification>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      notification_category: NotificationCategory;
    };
    CompositeTypes: Record<string, never>;
  };
}
