"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { CollegeForm } from "./form";
import type { School } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, Archive, Trash2 } from "lucide-react";
import { AppModal } from "@/components/overlays/app-modal";
import { archiveSchool, deleteSchool } from "@/features/admin/academic-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CollegesClient({ data }: { data: School[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<School | undefined>();
  const [itemToArchive, setItemToArchive] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleEdit = (item: School) => {
    setEditingData(item);
    setIsFormOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!itemToArchive) return;
    const result = await archiveSchool(itemToArchive);
    if (result.error) toast.error(result.error);
    else { toast.success("Archived successfully."); router.refresh(); }
    setItemToArchive(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const result = await deleteSchool(itemToDelete);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted successfully."); router.refresh(); }
    setItemToDelete(null);
  };

  const columns = getColumns(handleEdit, setItemToArchive, setItemToDelete);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground">Manage university schools.</p>
        </div>
        <Button onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add School
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="code" searchPlaceholder="Search..." emptyTitle="No records found" />
      <CollegeForm open={isFormOpen} onOpenChange={setIsFormOpen} initialData={editingData} />
      
      <AppModal
        title="Archive School"
        description="Are you sure you want to archive this record? It will be hidden from active views."
        open={!!itemToArchive}
        onOpenChange={(val) => !val && setItemToArchive(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setItemToArchive(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleArchiveConfirm}><Archive className="mr-2 h-4 w-4" /> Archive</Button>
          </>
        }
      ><p className="text-sm text-muted-foreground">You can restore archived records later if needed.</p></AppModal>

      <AppModal
        title="Delete School"
        description="Are you sure you want to permanently delete this college? This will also cascade delete all associated departments, programs, semesters, sections, subjects, timetables, and assignments. This action cannot be undone."
        open={!!itemToDelete}
        onOpenChange={(val) => !val && setItemToDelete(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground font-medium text-destructive bg-destructive/10 p-3 rounded-md">
          Warning: Deleting a college is highly destructive and will wipe out all nested structural child configurations (Departments, Programs, Semesters, Sections, Subjects) in the database.
        </p>
      </AppModal>
    </>
  );
}
