"use client";

import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProgram, updateProgram } from "@/features/admin/academic-actions";
import type { Department, Program, School } from "@/types/database";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";

const schema = z.object({
  school_id: z.string().min(1, "Required"),
  department_id: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  duration: z.coerce.number().int().min(1, "Required")
});
type ProgramFormValues = { school_id: string; department_id: string; code: string; name: string; duration: number };

export function ProgramForm({ initialData, open, onOpenChange, departments, schools }: { initialData?: Program; open: boolean; onOpenChange: (open: boolean) => void; departments: Department[]; schools: School[] }) {
  const router = useRouter();
  const isEditing = !!initialData;
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<ProgramFormValues>,
    defaultValues: initialData ? { school_id: departments.find((department) => department.id === initialData.department_id)?.school_id ?? "", department_id: initialData.department_id, code: initialData.code, name: initialData.name, duration: initialData.duration ?? 4 } : {},
  });
  const schoolId = useWatch({ control: form.control, name: "school_id" });
  const availableDepartments = departments.filter((department) => department.school_id === schoolId);

  async function onSubmit(values: ProgramFormValues) {
    const result = isEditing ? await updateProgram(initialData.id, values) : await createProgram(values);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Program ${isEditing ? "updated" : "created"} successfully.`);
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <AppModal
      title={isEditing ? "Edit Program" : "Add Program"}
      open={open}
      onOpenChange={(val) => { onOpenChange(val); if (!val) form.reset(); }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="school_id"
            render={({ field }) => (
              <FormItem><FormLabel>School</FormLabel><FormControl><select {...field} className="h-10 w-full rounded-md border bg-background px-3" onChange={(event) => { field.onChange(event); form.setValue("department_id", ""); }}><option value="">Select a school</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl><select {...field} className="h-10 w-full rounded-md border bg-background px-3" disabled={!schoolId}><option value="">Select a department</option>{availableDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration (years)</FormLabel><FormControl><Input {...field} value={field.value || ""} type="number" min="1" /></FormControl><FormMessage /></FormItem>)} />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CODE</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="text" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NAME</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="text" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Form>
    </AppModal>
  );
}
