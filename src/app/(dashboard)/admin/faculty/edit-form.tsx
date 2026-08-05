"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateFaculty } from "@/features/admin/user-actions";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  phone: z.string().optional(),
  department_id: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  specialization: z.string().optional(),
  experience_years: z.coerce.number().min(0, "Invalid experience"),
  joining_date: z.string().min(1, "Joining date is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  is_hod: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface FacultyEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: any | null;
  departments: Array<{ id: string; name: string }>;
}

export function FacultyEditForm({
  open,
  onOpenChange,
  faculty,
  departments,
}: FacultyEditFormProps) {
  const router = useRouter();

  // faculty is always a plain object (flattened by getFaculty)
  const getFacultyData = (f: any) => f?.faculty;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      phone: "",
      department_id: "",
      designation: "",
      qualification: "",
      specialization: "",
      experience_years: 0,
      joining_date: "",
      employment_type: "Full Time",
      is_hod: false,
      is_active: true,
    },
  });

  // Populate form when faculty changes
  useEffect(() => {
    if (faculty && open) {
      const fd = getFacultyData(faculty);
      form.reset({
        phone: faculty.phone || "",
        department_id: fd?.department?.id || fd?.department_id || "",
        designation: fd?.designation || "",
        qualification: fd?.qualification || "",
        specialization: fd?.specialization || "",
        experience_years: fd?.experience_years ?? 0,
        joining_date: fd?.joining_date?.split("T")[0] || "",
        employment_type: fd?.employment_type || "Full Time",
        is_hod: fd?.is_hod ?? false,
        is_active: faculty.is_active ?? true,
      });
    }
  }, [faculty, open, form]);

  async function onSubmit(values: FormData) {
    if (!faculty?.id) return;
    const result = await updateFaculty(faculty.id, values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Faculty updated successfully.");
      onOpenChange(false);
      router.refresh();
    }
  }

  return (
    <AppModal
      title="Edit Faculty"
      description="Update faculty information. Employee ID and email are read-only."
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) form.reset();
      }}
      className="max-w-4xl"
    >
      {faculty && (
        <div className="mb-4 flex items-center gap-4 rounded-md bg-muted/50 px-4 py-2 text-sm border">
          <div>
            <p className="font-semibold text-foreground">{faculty.full_name}</p>
            <p className="text-muted-foreground text-[10px]">{faculty.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Employee ID</p>
            <p className="font-mono font-medium">{faculty.employee_or_student_id || "—"}</p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Phone</FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="9XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 w-full [&>span]:line-clamp-1">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Designation</FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="Assistant Professor" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Qualification</FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="Ph.D, M.Tech" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Specialization</FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="Machine Learning, VLSI" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Experience (Years)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-9"
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="joining_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Joining Date</FormLabel>
                  <FormControl>
                    <Input className="h-9" type="date" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select Employment Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Visiting">Visiting</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 mt-5">
              <FormField
                control={form.control}
                name="is_hod"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border px-2 h-9 w-full">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-[11px] font-medium cursor-pointer">
                      Head of Department
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border px-2 h-9 w-full">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-[11px] font-medium cursor-pointer">
                      Account Active
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </AppModal>
  );
}
