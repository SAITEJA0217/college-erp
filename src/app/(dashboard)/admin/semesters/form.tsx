"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSemester, updateSemester } from "@/features/admin/academic-actions";
import type { Semester } from "@/types/database";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";

const schema = z.object({
  academic_year_id: z.string().min(1, "Required"),
  program_id: z.string().min(1, "Required"),
  semester_number: z.coerce.number().min(0, "Invalid number"),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required")
});

export function SemesterForm({ initialData, open, onOpenChange }: { initialData?: Semester; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const isEditing = !!initialData;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<typeof schema>>,
    defaultValues: initialData ? {
      ...initialData,
      start_date: initialData.start_date ?? '',
      end_date: initialData.end_date ?? '',
    } : {},
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = isEditing ? await updateSemester(initialData.id, values) : await createSemester(values);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Semester ${isEditing ? "updated" : "created"} successfully.`);
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <AppModal
      title={isEditing ? "Edit Semester" : "Add Semester"}
      open={open}
      onOpenChange={(val) => { onOpenChange(val); if (!val) form.reset(); }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="academic_year_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ACADEMIC YEAR_ID</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="text" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="program_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PROGRAM ID</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="text" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEMESTER NUMBER</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="number" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>START DATE</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="text" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>END DATE</FormLabel>
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
