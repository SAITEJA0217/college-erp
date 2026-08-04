"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { StudentForm } from "./form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function StudentsClient({ data, departments, semesters, sections }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const columns = getColumns();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student accounts and enrollments.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="full_name" 
        searchPlaceholder="Search students..." 
        emptyTitle="No students found" 
      />

      <StudentForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        departments={departments}
        semesters={semesters}
        sections={sections}
      />
    </>
  );
}
