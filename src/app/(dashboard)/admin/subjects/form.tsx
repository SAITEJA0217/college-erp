"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSubject, updateSubject } from "@/features/admin/academic-actions";
import type { Subject } from "@/types/database";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";

const schema = z.object({
  section_id: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  credits: z.coerce.number().min(0, "Invalid number")
});

export function SubjectForm({ initialData, open, onOpenChange }: { initialData?: Subject; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const isEditing = !!initialData;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<typeof schema>>,
    defaultValues: initialData ? { ...initialData } : {},
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = isEditing ? await updateSubject(initialData.id, values) : await createSubject(values);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Subject ${isEditing ? "updated" : "created"} successfully.`);
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <AppModal
      title={isEditing ? "Edit Subject" : "Add Subject"}
      open={open}
      onOpenChange={(val) => { onOpenChange(val); if (!val) form.reset(); }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="section_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SECTION ID</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="text" autoFocus /></FormControl>
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
          <FormField
            control={form.control}
            name="credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CREDITS</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} type="number" /></FormControl>
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
