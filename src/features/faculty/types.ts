export interface FacultyProfileInfo {
  employee_or_student_id: string;
  full_name: string;
  department: string;
  designation: string;
}

export type ClassStatus = "Active" | "Upcoming" | "Completed";

export interface AssignedClass {
  id: string; // faculty_assignment.id
  subject_id: string;
  subject_code: string;
  subject_name: string;
  credits: number;
  section_id: string;
  section_name: string;
  semester_id: string;
  semester_number: number;
  academic_year_name: string;
  department_name: string;
  program_name: string;
  weekly_hours: number;
  students_count: number;
  status: ClassStatus;
}
