"use client";

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
import { createFaculty } from "@/features/admin/user-actions";
import { DEFAULT_PASSWORD } from "@/constants/auth";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";
import { Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// employee_id is auto-generated on the server — not in the form
const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department_id: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  specialization: z.string().optional(),
  experience_years: z.coerce.number().min(0, "Invalid experience"),
  joining_date: z.string().min(1, "Joining date is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  is_hod: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface FacultyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Array<{ id: string; name: string }>;
}

export function FacultyForm({ open, onOpenChange, departments }: FacultyFormProps) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      department_id: "",
      designation: "",
      qualification: "",
      specialization: "",
      experience_years: 0,
      joining_date: "",
      employment_type: "Full Time",
      is_hod: false,
    },
  });

  async function onSubmit(values: FormData) {
    const result = await createFaculty(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        <div className="flex flex-col gap-1.5 w-full">
          <span className="font-semibold">Faculty created successfully.</span>
          <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md border mt-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Employee ID</span>
              <code className="font-mono font-semibold text-primary">{result.employee_id}</code>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-6 text-[10px] px-2"
              onClick={() => {
                navigator.clipboard.writeText(result.employee_id!);
                toast.info("Employee ID copied to clipboard");
              }}
            >
              Copy
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Default Password: <span className="font-mono text-foreground font-medium">{DEFAULT_PASSWORD}</span>
          </div>
        </div>
      );
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <AppModal
      title="Add Faculty"
      description="Employee ID is auto-assigned. Default password is Welcome@2024."
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) form.reset();
      }}
      className="max-w-4xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Full Name</FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="Dr. John Smith" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Email</FormLabel>
                  <FormControl>
                    <Input className="h-9" type="email" placeholder="faculty@mruh.edu.in" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Phone (optional)</FormLabel>
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
                  <FormLabel className="text-xs">Specialization (optional)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="is_hod"
              render={({ field }) => (
                <FormItem className="col-span-2 flex flex-row items-center space-x-2 space-y-0 rounded-md border p-2 mt-5 h-9">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="text-xs font-medium cursor-pointer">Head of Department</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center gap-2 mb-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-1.5 w-max">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">Employee ID</span> is auto-assigned as <span className="font-mono font-semibold text-primary">FAC001</span>… based on creation order.
            </p>
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
              {form.formState.isSubmitting ? "Creating..." : "Create Faculty"}
            </Button>
          </div>
        </form>
      </Form>
    </AppModal>
  );
}
