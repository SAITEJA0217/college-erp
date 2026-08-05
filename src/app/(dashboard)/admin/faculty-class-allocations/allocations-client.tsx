"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, ShieldBan, SlidersHorizontal, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AllocationModal } from "./allocation-modal";
import { deleteFacultyAssignment } from "@/features/admin/allocation-actions";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

export function AllocationsClient({ initialData, formData }: { initialData: any[], formData: any }) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const matchSearch = 
        item.faculty?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.faculty?.employee_or_student_id?.toLowerCase().includes(search.toLowerCase()) ||
        item.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.subject?.code?.toLowerCase().includes(search.toLowerCase()) ||
        item.section?.name?.toLowerCase().includes(search.toLowerCase());
      
      const matchDept = selectedDept === "all" || item.department_id === selectedDept;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });
  }, [initialData, search, selectedDept, selectedStatus]);

  async function handleDelete(id: string) {
    const res = await deleteFacultyAssignment(id);
    if (res.error) toast.error(res.error);
    else toast.success("Assignment deleted successfully");
    setDeleteConfirm(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search faculty, subject, section..."
              className="pl-9 w-full bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[140px] bg-card hidden sm:flex">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {formData.departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[130px] bg-card hidden sm:flex">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditingRecord(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Class
        </Button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Faculty</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.faculty?.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.faculty?.employee_or_student_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium max-w-[200px] truncate" title={item.subject?.name}>{item.subject?.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.subject?.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{item.section?.name}</span>
                    </TableCell>
                    <TableCell>{item.semester?.semester_number}</TableCell>
                    <TableCell>
                      {item.day_of_week && item.start_time ? (
                        <div className="flex flex-col">
                          <span className="text-xs">{item.day_of_week}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.start_time.substring(0,5)} - {item.end_time?.substring(0,5)}
                            {item.room_number ? ` • ${item.room_number}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No Schedule</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => { setEditingRecord(item); setModalOpen(true); }}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteConfirm(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No class allocations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AllocationModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        initialData={editingRecord}
        formData={formData}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class assignment. If you just want to mark it as finished, consider changing the status to Completed instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
