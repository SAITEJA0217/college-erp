"use client";

import * as React from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/overlays/app-modal";

interface FormShellProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}

export function FormShell<T extends FieldValues>({
  form,
  onSubmit,
  children,
  submitLabel = "Save",
  className,
}: FormShellProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        <div className="space-y-4">{children}</div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface FormModalProps<T extends FieldValues> {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  // Accept any Zod schema; resolver generics vary across Zod 3/4.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  defaultValues: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  submitLabel?: string;
}

export function FormModal<T extends FieldValues>({
  title,
  description,
  trigger,
  schema,
  defaultValues,
  onSubmit,
  children,
  submitLabel = "Save",
}: FormModalProps<T>) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  async function handleSubmit(values: T) {
    await onSubmit(values);
    setOpen(false);
    form.reset(defaultValues);
  }

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description={description}
    >
      <FormShell form={form} onSubmit={handleSubmit} submitLabel={submitLabel}>
        {children(form)}
      </FormShell>
    </AppModal>
  );
}
