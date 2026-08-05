"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicYearsClient } from "../academic-years/client";
import { SectionsClient } from "../sections/client";
import type { AcademicYear, Section } from "@/types/database";

interface ClassesClientProps {
  academicYears: AcademicYear[];
  sections: Section[];
}

export function ClassesClient({ academicYears, sections }: ClassesClientProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-muted-foreground">Manage academic years, sections, and class strength.</p>
        </div>
      </div>

      <Tabs defaultValue="academic-years" className="space-y-4">
        <TabsList>
          <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="academic-years" className="space-y-4">
          <AcademicYearsClient data={academicYears} />
        </TabsContent>
        
        <TabsContent value="sections" className="space-y-4">
          <SectionsClient data={sections} />
        </TabsContent>
      </Tabs>
    </>
  );
}
