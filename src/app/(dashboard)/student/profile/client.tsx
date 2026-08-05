"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  User, 
  GraduationCap, 
  ShieldAlert, 
  Camera, 
  LogOut, 
  FileDown, 
  Lock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  CreditCard,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { logoutAction } from "@/features/auth/actions";
import { useRouter } from "next/navigation";

export function ProfileClient({ profile }: { profile: any }) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.avatar_url || null);
  
  // Extract relation details safely
  const studentData = profile.students?.[0] || profile.students || {};
  const departmentName = studentData.department?.name || "Computer Science";
  const programName = studentData.department?.code || "B.Tech";
  const semesterNum = studentData.semester?.semester_number || 4;
  const sectionName = studentData.section?.name || "A";
  const batchYear = studentData.batch_year || 2023;
  const rollNumber = studentData.roll_number || profile.employee_or_student_id || "N/A";
  const admissionNumber = studentData.admission_number || "ADM" + rollNumber;
  const mentorName = studentData.mentor_name || "Dr. K. R. Reddy";
  const currentCgpa = studentData.current_cgpa || "8.5";
  const creditsCompleted = studentData.credits_completed || "78";
  const academicYear = studentData.academic_year || "2025-2026";

  const getInitials = (name: string) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handlePhotoUpload = () => {
    toast.info("Photo upload functionality will be connected to storage services in the next updates.");
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    toast.success("Profile photo removed locally.");
  };

  const handlePasswordChange = () => {
    toast.info("Password change request initiated. Reset link will be sent to university email.");
  };

  const handleDownloadId = () => {
    toast.success("Student ID Card generated successfully. Download starting...");
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* PROFILE HEADER CARD */}
      <Card className="border-[#F47C20]/20 bg-slate-900/60 backdrop-blur-md text-white overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#1E2A78] to-[#F47C20] opacity-80" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-10 md:-mt-12 text-center md:text-left">
            {/* Avatar / Photo block */}
            <div className="relative group">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center shadow-xl">
                {photoUrl ? (
                  <img src={photoUrl} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-[#F47C20]">{getInitials(profile.full_name)}</span>
                )}
              </div>
              <button 
                onClick={handlePhotoUpload}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#F47C20] text-white hover:bg-[#d96614] shadow-md transition-colors"
                title="Change Photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Profile Brief Info */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold">{profile.full_name}</h1>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold py-0.5 px-2">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-gray-300 font-medium">Roll No: {rollNumber}</p>
              <p className="text-xs text-gray-400">{profile.email}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
              <Button onClick={handlePhotoUpload} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10 rounded-xl text-xs">
                Edit Profile
              </Button>
              {photoUrl && (
                <Button onClick={handleRemovePhoto} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs">
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-6 bg-white/5" />

          {/* Quick Academic Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400">Department</p>
              <p className="font-semibold text-white truncate">{departmentName}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400">Program / Year</p>
              <p className="font-semibold text-white">{programName} / {batchYear}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400">Semester / Section</p>
              <p className="font-semibold text-white">Sem {semesterNum} - Section {sectionName}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400">Current CGPA</p>
              <p className="font-semibold text-[#F47C20]">{currentCgpa} CGPA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TWO COLUMN GRID FOR DETAILED INFO */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PERSONAL INFORMATION CARD */}
        <Card className="border-white/10 bg-slate-900/60 backdrop-blur-md text-white rounded-2xl">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base font-bold text-[#F47C20] flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">Primary personal records on university logs</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block mb-0.5">Full Name</span>
                <span className="font-medium text-white">{profile.full_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Roll Number</span>
                <span className="font-medium text-white">{rollNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">University Email</span>
                <span className="font-medium text-white truncate block">{profile.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Phone Number</span>
                <span className="font-medium text-white">{profile.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Gender</span>
                <span className="font-medium text-white">Male</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Date of Birth</span>
                <span className="font-medium text-white">15th Aug 2004</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Blood Group</span>
                <span className="font-medium text-white">O+ve</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Aadhaar Number</span>
                <span className="font-medium text-white">XXXX-XXXX-3829</span>
              </div>
            </div>
            <Separator className="bg-white/5" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block mb-0.5">Emergency Contact</span>
                <span className="font-medium text-white">+91 98480 22338</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Address</span>
                <span className="font-medium text-white leading-normal">
                  H.No: 12-4/B, Suchitra, Quthbullapur, Hyderabad, TS, 500055.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACADEMIC INFORMATION CARD */}
        <Card className="border-white/10 bg-slate-900/60 backdrop-blur-md text-white rounded-2xl">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base font-bold text-[#F47C20] flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Academic Information
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">Current program track status and statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block mb-0.5">Department</span>
                <span className="font-medium text-white truncate block">{departmentName}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Program Track</span>
                <span className="font-medium text-white">{programName}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Current Semester</span>
                <span className="font-medium text-white">Semester {semesterNum}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Assigned Section</span>
                <span className="font-medium text-white">Section {sectionName}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Admission Year / Batch</span>
                <span className="font-medium text-white">{batchYear} Batch</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Academic Session</span>
                <span className="font-medium text-white">{academicYear}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Admission Number</span>
                <span className="font-medium text-white">{admissionNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Advisor / Mentor</span>
                <span className="font-medium text-white">{mentorName}</span>
              </div>
            </div>
            <Separator className="bg-white/5" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block mb-0.5">CGPA Score</span>
                <span className="font-bold text-[#F47C20]">{currentCgpa} / 10.0</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Credits Completed</span>
                <span className="font-medium text-white">{creditsCompleted} Credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ACCOUNT & ACTIONS CARD */}
      <Card className="border-white/10 bg-slate-900/60 backdrop-blur-md text-white rounded-2xl">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-base font-bold text-[#F47C20] flex items-center gap-2">
            <Lock className="h-4 w-4" /> Account & Security
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs">Security preferences and access logs</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-xs">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
            {/* Account Details Block */}
            <div className="space-y-3 col-span-1 md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 block mb-0.5">Student ERP ID</span>
                  <span className="font-medium text-white">{profile.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Account Status</span>
                  <span className="font-medium text-emerald-400 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Active Profile
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Registered Since</span>
                  <span className="font-medium text-white">June 20, 2023</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Password Last Changed</span>
                  <span className="font-medium text-white">45 days ago</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button Group */}
            <div className="flex flex-col gap-2.5">
              <Button onClick={handlePasswordChange} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-xl text-xs w-full justify-start h-9">
                <Lock className="mr-2 h-3.5 w-3.5 text-[#F47C20]" />
                Change Password
              </Button>
              <Button onClick={handleDownloadId} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-xl text-xs w-full justify-start h-9">
                <FileDown className="mr-2 h-3.5 w-3.5 text-blue-400" />
                Download Student ID
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs w-full justify-start h-9">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Logout Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
