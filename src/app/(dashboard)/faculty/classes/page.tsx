import { Suspense } from "react";
import { getAssignedClasses, getFacultyProfileInfo } from "@/features/faculty/classes-actions";
import { ClassesClient } from "./classes-client";
import ClassesLoading from "./loading";

export const metadata = {
  title: "My Classes | Faculty Portal",
  description: "View and manage your assigned classes.",
};

export default async function FacultyClassesPage() {
  const profileInfo = await getFacultyProfileInfo();
  const initialClasses = await getAssignedClasses();

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground">View and manage your assigned classes.</p>
      </div>
      
      <Suspense fallback={<ClassesLoading />}>
        <ClassesClient initialClasses={initialClasses} profileInfo={profileInfo} />
      </Suspense>
    </div>
  );
}
