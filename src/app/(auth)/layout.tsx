import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-slate-900 overflow-hidden">
      {/* Left Column: Campus Branding Backdrop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1E2A78] via-[#121948] to-[#0A0D26] relative overflow-hidden text-white border-r border-[#F47C20]/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#F47C20]/10 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 font-semibold text-white/90 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to website</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F47C20] text-white shadow-xl shadow-orange-500/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Malla Reddy University
            </h1>
            <p className="text-[#F47C20] font-bold text-lg tracking-wider uppercase">
              Digital Campus Management System
            </p>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm">
            Unified access portal for students, faculty, and administrative departments. Access schedules, course resources, attendance reports, and university-wide announcements.
          </p>
        </div>

        <div className="relative z-10 text-xs text-gray-400">
          <span>© 2026 Malla Reddy University. Developed for MRUH ERP.</span>
        </div>
      </div>

      {/* Right Column: Centralized Login Form Container */}
      <div className="flex items-center justify-center bg-slate-950 p-4 sm:p-12 relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1E2A78]/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-full max-w-md relative z-10 pt-4 pb-8 sm:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
