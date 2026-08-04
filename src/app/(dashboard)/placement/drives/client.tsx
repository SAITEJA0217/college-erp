"use client";

import { useState } from "react";
import { createPlacement } from "@/features/placement/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export function DrivesClient({ initialDrives }: { initialDrives: any[] }) {
  const [drives, setDrives] = useState(initialDrives);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      company_name: formData.get("company_name"),
      job_role: formData.get("job_role"),
      ctc: formData.get("ctc"),
      application_deadline: formData.get("application_deadline"),
      placement_type: formData.get("placement_type"),
      eligibility_cgpa: parseFloat(formData.get("eligibility_cgpa") as string),
      locations: formData.get("locations")
    };

    await createPlacement(data);
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Drive</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campus Drive</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input name="company_name" required />
                </div>
                <div className="space-y-2">
                  <Label>Job Role</Label>
                  <Input name="job_role" required />
                </div>
                <div className="space-y-2">
                  <Label>CTC / Stipend</Label>
                  <Input name="ctc" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="datetime-local" name="application_deadline" required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="placement_type" defaultValue="full-time">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Eligibility (Min CGPA)</Label>
                  <Input type="number" step="0.01" name="eligibility_cgpa" defaultValue="0" required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Locations</Label>
                  <Input name="locations" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Drive"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>CTC</TableHead>
              <TableHead>Min CGPA</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drives.map((drive) => (
              <TableRow key={drive.id}>
                <TableCell className="font-medium">{drive.company_name}</TableCell>
                <TableCell>{drive.job_role}</TableCell>
                <TableCell className="capitalize">{drive.placement_type}</TableCell>
                <TableCell>{drive.ctc || "N/A"}</TableCell>
                <TableCell>{drive.eligibility_cgpa}</TableCell>
                <TableCell>{format(new Date(drive.application_deadline), "PPp")}</TableCell>
              </TableRow>
            ))}
            {drives.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No campus drives found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
