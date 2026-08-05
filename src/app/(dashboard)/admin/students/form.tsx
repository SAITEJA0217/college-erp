"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createStudent } from "@/features/admin/user-actions";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/overlays/app-modal";

const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  roll_number: z.string().min(1, "Roll Number is required"),
  department_id: z.string().min(1, "Department is required"),
  section_id: z.string().min(1, "Section is required"),
  batch_year: z.coerce.number().min(2000, "Invalid year"),
});

type FormData = z.infer<typeof schema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string }>;
}

export function StudentForm({ open, onOpenChange, departments, sections }: StudentFormProps) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      full_name: "", email: "", roll_number: "", department_id: "", section_id: "", batch_year: new Date().getFullYear(),
    },
  });

  async function onSubmit(values: FormData) {
    const result = await createStudent(values);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Student created successfully. Default password is 'Welcome@2024'");
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <AppModal title="Add Student" open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) form.reset(); }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="roll_number" render={({ field }) => (
              <FormItem><FormLabel>Roll Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="batch_year" render={({ field }) => (
              <FormItem><FormLabel>Batch Year</FormLabel><FormControl><Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="department_id" render={({ field }) => (
              <FormItem><FormLabel>Department</FormLabel>
                <FormControl>
                  <select {...field} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                    <option value="" className="bg-background">Select Department</option>
                    {departments?.map((d) => <option key={d.id} value={d.id} className="bg-background">{d.name}</option>)}
                  </select>
                </FormControl>
              <FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="section_id" render={({ field }) => (
              <FormItem><FormLabel>Section</FormLabel>
                <FormControl>
                  <select {...field} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                    <option value="" className="bg-background">Select Section</option>
                    {sections?.map((s: any) => <option key={s.id} value={s.id} className="bg-background">Section {s.name}</option>)}
                  </select>
                </FormControl>
              <FormMessage /></FormItem>
            )} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create Student"}</Button>
          </div>
        </form>
      </Form>
    </AppModal>
  );
}
