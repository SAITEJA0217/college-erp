"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createDepartment, updateDepartment } from "@/features/admin/academic-actions";
import type { Department, School } from "@/types/database";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";

const schema = z.object({
  school_id: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  name: z.string().min(1, "Required")
});

export function DepartmentForm({ initialData, open, onOpenChange, schools }: { initialData?: Department; open: boolean; onOpenChange: (open: boolean) => void; schools: School[] }) {
  const router = useRouter();
  const isEditing = !!initialData;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<typeof schema>>,
    defaultValues: initialData ? {
      school_id: initialData.school_id ?? '',
      code: initialData.code,
      name: initialData.name,
    } : {},
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = isEditing ? await updateDepartment(initialData.id, values) : await createDepartment(values);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Department ${isEditing ? "updated" : "created"} successfully.`);
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <AppModal
      title={isEditing ? "Edit Department" : "Add Department"}
      open={open}
      onOpenChange={(val) => { onOpenChange(val); if (!val) form.reset(); }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="school_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School</FormLabel>
                <FormControl><select {...field} className="h-10 w-full rounded-md border bg-background px-3"><option value="">Select a school</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name} ({school.code})</option>)}</select></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
