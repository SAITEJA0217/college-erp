"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { AcademicYearForm } from "./form";
import type { AcademicYear } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { AppModal } from "@/components/overlays/app-modal";
import { archiveAcademicYear, cloneAcademicSession } from "@/features/admin/academic-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function AcademicYearsClient({ data }: { data: AcademicYear[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<AcademicYear | undefined>();
  const [itemToArchive, setItemToArchive] = useState<string | null>(null);
  const [itemToClone, setItemToClone] = useState<AcademicYear | null>(null);
  const [cloneYearName, setCloneYearName] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  const handleEdit = (item: AcademicYear) => {
    setEditingData(item);
    setIsFormOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!itemToArchive) return;
    const result = await archiveAcademicYear(itemToArchive);
    if (result.error) toast.error(result.error);
    else { toast.success("Archived successfully."); router.refresh(); }
    setItemToArchive(null);
  };

  const handleCloneConfirm = async () => {
    if (!itemToClone || !cloneYearName) return;
    setIsCloning(true);
    const result = await cloneAcademicSession(itemToClone.id, cloneYearName);
    setIsCloning(false);
    
    if (result.error) toast.error(result.error);
    else { 
      toast.success("Academic Session Cloned successfully!"); 
      router.refresh(); 
      setItemToClone(null);
      setCloneYearName("");
    }
  };

  const columns = getColumns(handleEdit, setItemToArchive, (item) => {
    setItemToClone(item);
    // Suggest next year
    const yearParts = item.name.split("-");
    if (yearParts.length === 2 && !isNaN(parseInt(yearParts[0]))) {
      setCloneYearName(`${parseInt(yearParts[0]) + 1}-${parseInt(yearParts[1]) + 1}`);
    }
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add AcademicYear
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search..." emptyTitle="No records found" />
      <AcademicYearForm open={isFormOpen} onOpenChange={setIsFormOpen} initialData={editingData} />
      <AppModal
        title="Archive AcademicYear"
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
        title="Clone Academic Session"
        description={`Cloning "${itemToClone?.name}" will copy all Sections and Subjects to the new Academic Year. Faculty, Timetable, Attendance, and Marks will NOT be duplicated.`}
        open={!!itemToClone}
        onOpenChange={(val) => !val && setItemToClone(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setItemToClone(null)} disabled={isCloning}>Cancel</Button>
            <Button onClick={handleCloneConfirm} disabled={isCloning || !cloneYearName}>
              {isCloning ? "Cloning..." : "Confirm Clone"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Academic Year Name</label>
            <Input 
              placeholder="e.g. 2026-2027" 
              value={cloneYearName} 
              onChange={(e) => setCloneYearName(e.target.value)} 
              disabled={isCloning}
            />
            <p className="text-xs text-muted-foreground">This will create a new Academic Year and link all cloned data to it.</p>
          </div>
        </div>
      </AppModal>
    </>
  );
}
