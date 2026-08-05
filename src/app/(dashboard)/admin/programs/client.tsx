"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { ProgramForm } from "./form";
import type { Department, Program, School } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { AppModal } from "@/components/overlays/app-modal";
import { archiveProgram } from "@/features/admin/academic-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProgramsClient({ data, departments, schools }: { data: Program[]; departments: Department[]; schools: School[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Program | undefined>();
  const [itemToArchive, setItemToArchive] = useState<string | null>(null);

  const handleEdit = (item: Program) => {
    setEditingData(item);
    setIsFormOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!itemToArchive) return;
    const result = await archiveProgram(itemToArchive);
    if (result.error) toast.error(result.error);
    else { toast.success("Archived successfully."); router.refresh(); }
    setItemToArchive(null);
  };

  const columns = getColumns(handleEdit, setItemToArchive);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage programs.</p>
        </div>
        <Button onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Program
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search programs..." emptyTitle="No records found" />
      <ProgramForm open={isFormOpen} onOpenChange={setIsFormOpen} initialData={editingData} departments={departments} schools={schools} />
      <AppModal
        title="Archive Program"
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
    </>
  );
}
