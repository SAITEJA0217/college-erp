"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { FacultyForm } from "./form";
import { FacultyEditForm } from "./edit-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FacultyClientProps {
  data: any[];
  departments: Array<{ id: string; name: string }>;
}

export function FacultyClient({ data, departments }: FacultyClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);

  const columns = getColumns({
    departments,
    onEdit: (faculty) => setEditingFaculty(faculty),
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
          <p className="text-muted-foreground">
            Manage faculty accounts and academic staff.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Faculty
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="full_name"
        searchPlaceholder="Search faculty..."
        emptyTitle="No faculty found"
      />

      <FacultyForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        departments={departments}
      />

      <FacultyEditForm
        open={!!editingFaculty}
        onOpenChange={(open) => {
          if (!open) setEditingFaculty(null);
        }}
        faculty={editingFaculty}
        departments={departments}
      />
    </>
  );
}
