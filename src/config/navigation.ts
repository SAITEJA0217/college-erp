import type { DashboardRole } from "@/types/roles";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarDays,
  CalendarRange,
  School,
  ClipboardCheck,
  CalendarClock,
  Briefcase,
  Megaphone,
  BarChart3,
  Settings,
  UserRound,
  FileText,
  Bell,
  BookMarked,
  Network,
  ClipboardList,
  BrainCircuit,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Feature routes stubbed until later phases */
  disabled?: boolean;
  items?: NavItem[];
}

export const ROLE_HOME: Record<DashboardRole, string> = {
  student: "/student",
  faculty: "/faculty",
  hod: "/hod",
  placement: "/placement",
  admin: "/admin",
};

export const ROLE_LABELS: Record<DashboardRole, string> = {
  student: "Student",
  faculty: "Faculty",
  hod: "Head of Department",
  placement: "Placement Cell",
  admin: "Administrator",
};

const studentNav: NavItem[] = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  { title: "My Profile", href: "/student/profile", icon: UserRound },
  { title: "Timetable", href: "/student/timetable", icon: CalendarClock },
  { title: "Placements", href: "/student/placements", icon: Briefcase },
  { title: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { title: "Study Materials", href: "/student/notes", icon: BookMarked },
  { title: "Assignments", href: "/student/assignments", icon: FileText },
  { title: "Quizzes", href: "/student/quizzes", icon: BrainCircuit },
  { title: "Notifications", href: "/student/notifications", icon: Bell },
  { title: "Help Desk", href: "/student/help-desk", icon: Settings },
];

const facultyNav: NavItem[] = [
  { title: "Dashboard", href: "/faculty", icon: LayoutDashboard },
  { title: "My Classes", href: "/faculty/classes", icon: School },
  { title: "Timetable", href: "/faculty/timetable", icon: CalendarClock },
  { title: "Attendance", href: "/faculty/attendance", icon: ClipboardCheck },
  { title: "Study Materials", href: "/faculty/notes", icon: BookMarked },
  { title: "Assignments", href: "/faculty/assignments", icon: FileText },
  { title: "Quizzes", href: "/faculty/quizzes", icon: BrainCircuit },
  { title: "Notifications", href: "/faculty/notifications", icon: Bell },
  { title: "Help Desk", href: "/faculty/help-desk", icon: Settings },
];

const hodNav: NavItem[] = [
  { title: "Dashboard", href: "/hod", icon: LayoutDashboard },
  { title: "Department", href: "/hod/department", icon: Building2 },
  { title: "Faculty", href: "/hod/faculty", icon: Users },
  { title: "Students", href: "/hod/students", icon: GraduationCap },
  { title: "Timetable", href: "/hod/timetable", icon: CalendarClock },
  { title: "Reports", href: "/hod/reports", icon: BarChart3 },
  { title: "Announcements", href: "/hod/announcements", icon: Megaphone },
  { title: "Notifications", href: "/hod/notifications", icon: Bell },
  { title: "Help Desk", href: "/hod/help-desk", icon: Settings },
];

const placementNav: NavItem[] = [
  { title: "Dashboard", href: "/placement", icon: LayoutDashboard },
  { title: "Campus Drives", href: "/placement/drives", icon: Building2 },
  { title: "Applications", href: "/placement/applications", icon: Users },
  { title: "Reports", href: "/placement/reports", icon: FileText },
  { title: "Announcements", href: "/placement/announcements", icon: Megaphone },
  { title: "Notifications", href: "/placement/notifications", icon: Bell },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Academic Setup Wizard", href: "/admin/setup-wizard", icon: BrainCircuit },
  {
    title: "Academic Management",
    href: "#",
    icon: BookOpen,
    items: [
      { title: "Schools", href: "/admin/colleges", icon: Building2 },
      { title: "Departments", href: "/admin/departments", icon: Network },
      { title: "Programs", href: "/admin/programs", icon: GraduationCap },
      { title: "Class Management", href: "/admin/classes", icon: Users },
      { title: "Subjects", href: "/admin/subjects", icon: BookMarked },
      { title: "Faculty", href: "/admin/faculty", icon: Users },
      { title: "Timetable", href: "/admin/timetable", icon: CalendarClock },
      { title: "Study Materials", href: "/admin/notes", icon: BookMarked },
    ],
  },
  { title: "Students", href: "/admin/students", icon: GraduationCap },
  { title: "Placements", href: "/admin/placements", icon: Briefcase, disabled: true },
  { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export const ROLE_NAVIGATION: Record<DashboardRole, NavItem[]> = {
  student: studentNav,
  faculty: facultyNav,
  hod: hodNav,
  placement: placementNav,
  admin: adminNav,
};

export function getRoleFromPathname(pathname: string): DashboardRole | null {
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/faculty")) return "faculty";
  if (pathname.startsWith("/hod")) return "hod";
  if (pathname.startsWith("/placement")) return "placement";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/departments",
  "/admissions",
  "/placements",
  "/gallery",
  "/contact",
  "/login",
] as const;

export const AUTH_ROUTES = ["/login"] as const;
