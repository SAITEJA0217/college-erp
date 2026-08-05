import { getSchools, getDepartments, getPrograms, getAcademicYears, getSections, getSubjects } from "@/features/admin/academic-actions";
import { getFaculty } from "@/features/admin/user-actions";
import { SetupWizardClient } from "./client";

export default async function SetupWizardPage() {
  const [schools, departments, programs, academicYears, sections, subjects, faculty] = await Promise.all([
    getSchools(),
    getDepartments(),
    getPrograms(),
    getAcademicYears(),
    getSections(),
    getSubjects(),
    getFaculty(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <SetupWizardClient 
        initialSchools={schools}
        initialDepartments={departments}
        initialPrograms={programs}
        initialAcademicYears={academicYears}
        initialSections={sections}
        initialSubjects={subjects}
        initialFaculty={faculty}
      />
    </div>
  );
}
