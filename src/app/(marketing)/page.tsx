import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative w-full h-full flex items-center justify-center py-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07] pointer-events-none" />
      <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#F47C20]/10 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[90px] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-lg px-4 sm:max-w-6xl sm:px-6 flex flex-col items-center text-center justify-center z-10">
        <div className="space-y-4 sm:space-y-6 w-full max-w-md sm:max-w-2xl">
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F47C20]/15 border border-[#F47C20]/30 text-[#F47C20] text-[10px] sm:text-xs font-bold tracking-wider uppercase">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Digital Campus Management System
          </div>

          {/* Main Headings */}
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Malla Reddy University <span className="text-[#F47C20]">Acadaemix</span>
          </h1>

          <p className="mx-auto max-w-xs sm:max-w-xl text-sm sm:text-base text-gray-300 leading-relaxed">
            One unified platform for Students, Faculty, HODs, Placement Cell, Examination Branch, and University Administration.
          </p>

          <div className="flex justify-center pt-1">
            <Button asChild size="lg" className="w-full max-w-[320px] h-[52px] rounded-xl bg-gradient-to-r from-[#F47C20] to-[#e66c12] hover:scale-[1.03] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/20 transition-all duration-200">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
