"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppModal } from "@/components/overlays/app-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createFacultyAssignment, updateFacultyAssignment } from "@/features/admin/allocation-actions";

export const allocationSchema = z.object({
  faculty_profile_id: z.string().min(1, "Faculty is required"),
  department_id: z.string().min(1, "Department is required"),
  semester_id: z.string().min(1, "Semester is required"),
  section_id: z.string().min(1, "Section is required"),
  subject_id: z.string().min(1, "Subject is required"),
  academic_year: z.string().min(1, "Academic Year is required"),
  room_number: z.string().optional(),
  day_of_week: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(["Active", "Completed"]),
});

export type AllocationFormValues = z.infer<typeof allocationSchema>;

interface AllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  formData: {
    faculty: any[];
    departments: any[];
    semesters: any[];
    sections: any[];
    subjects: any[];
  };
}

export function AllocationModal({ open, onOpenChange, initialData, formData }: AllocationModalProps) {
  const isEditing = !!initialData;
  
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      faculty_profile_id: initialData?.faculty_profile_id || "",
      department_id: initialData?.department_id || "",
      semester_id: initialData?.semester_id || "",
      section_id: initialData?.section_id || "",
      subject_id: initialData?.subject_id || "",
      academic_year: initialData?.academic_year || "",
      room_number: initialData?.room_number || "",
      day_of_week: initialData?.day_of_week || "",
      start_time: initialData?.start_time ? initialData.start_time.substring(0, 5) : "",
      end_time: initialData?.end_time ? initialData.end_time.substring(0, 5) : "",
      status: initialData?.status || "Active",
    }
  });

  const selectedDepartmentId = form.watch("department_id");
  const selectedSemesterId = form.watch("semester_id");


  // Filter options based on selections
  const filteredSemesters = formData.semesters.filter(s => {
    if (!selectedDepartmentId) return true;
    const deptId = Array.isArray(s.program) ? s.program[0]?.department_id : s.program?.department_id;
    return deptId === selectedDepartmentId;
  });

  const filteredSections = formData.sections.filter(s => {
    if (!selectedSemesterId) return true;
    return s.semester_id === selectedSemesterId;
  });

  const filteredSubjects = formData.subjects.filter(s => {
    if (!selectedDepartmentId) return true; // Subjects might not have clear direct link to department without deep population, but we try:
    return true; // We can improve subject filtering if needed later.
  });

  async function onSubmit(values: AllocationFormValues) {
    if (values.start_time && !values.end_time) {
      form.setError("end_time", { message: "End time is required if start time is provided" });
      return;
    }
    if (values.end_time && !values.start_time) {
      form.setError("start_time", { message: "Start time is required if end time is provided" });
      return;
    }

    // Format times for PostgreSQL TIME (HH:MM:SS) if provided
    const payload = {
      ...values,
      start_time: values.start_time ? `${values.start_time}:00` : undefined,
      end_time: values.end_time ? `${values.end_time}:00` : undefined,
    };

    const res = isEditing 
      ? await updateFacultyAssignment(initialData.id, payload)
      : await createFacultyAssignment(payload);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isEditing ? "Assignment updated successfully" : "Assignment created successfully");
      onOpenChange(false);
      form.reset();
    }
  }

  return (
    <AppModal
      title={isEditing ? "Edit Assignment" : "Assign Class"}
      description="Assign faculty to a specific class, subject, and timeslot."
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val && !isEditing) form.reset();
      }}
      className="max-w-3xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="faculty_profile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.faculty.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.full_name} ({f.employee_or_student_id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSubjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue("semester_id", "");
                    form.setValue("section_id", "");
                  }} defaultValue={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semester_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue("section_id", "");
                  }} defaultValue={field.value} disabled={isEditing || !selectedDepartmentId}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSemesters.map(s => {
                        const progName = Array.isArray(s.program) ? s.program[0]?.name : s.program?.name;
                        return (
                          <SelectItem key={s.id} value={s.id}>Semester {s.semester_number} ({progName || 'Unknown Program'})</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="section_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing || !selectedSemesterId}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSections.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3">Schedule (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Day" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 401A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? "Save Changes" : "Assign Class"}
            </Button>
          </div>
        </form>
      </Form>
    </AppModal>
  );
}
