"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { SubjectForm } from "./form";
import type { Subject } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { AppModal } from "@/components/overlays/app-modal";
import { archiveSubject, deleteSubject } from "@/features/admin/academic-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SubjectsClient({ data }: { data: Subject[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Subject | undefined>();
  const [itemToArchive, setItemToArchive] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleEdit = (item: Subject) => {
    setEditingData(item);
    setIsFormOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!itemToArchive) return;
    const result = await archiveSubject(itemToArchive);
    if (result.error) toast.error(result.error);
    else { toast.success("Archived successfully."); router.refresh(); }
    setItemToArchive(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const result = await deleteSubject(itemToDelete);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted successfully."); router.refresh(); }
    setItemToDelete(null);
  };

  const columns = getColumns(handleEdit, setItemToArchive, setItemToDelete);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage subjects.</p>
        </div>
        <Button onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="section_id" searchPlaceholder="Search..." emptyTitle="No records found" />
      <SubjectForm open={isFormOpen} onOpenChange={setIsFormOpen} initialData={editingData} />
      <AppModal
        title="Archive Subject"
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
        title="Delete Subject"
        description="Are you sure you want to permanently delete this subject? This action cannot be undone."
        open={!!itemToDelete}
        onOpenChange={(val) => !val && setItemToDelete(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </>
        }
      ><p className="text-sm text-destructive">This will permanently delete the subject.</p></AppModal>
    </>
  );
}
