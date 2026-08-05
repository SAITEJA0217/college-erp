"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { publishAnnouncement } from "@/features/enterprise/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const announcementSchema = z.object({
  title: z.string().trim().min(3).max(255),
  content: z.string().trim().min(3).max(5000),
  audience: z.enum(["everyone", "students", "faculty", "department", "section"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  department_id: z.string().uuid().optional().nullable(),
  section_id: z.string().uuid().optional().nullable(),
  attachment_url: z.string().url().optional().nullable(),
  publish_at: z.string().optional(),
  expires_at: z.string().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export function AnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      audience: "everyone",
      priority: "normal",
    }
  });

  const audience = watch("audience");

  const onSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        publish_at: data.publish_at ? new Date(data.publish_at).toISOString() : new Date().toISOString(),
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : undefined,
      };

      const result = await publishAnnouncement(formattedData);
      
      if (result.success) {
        toast.success("Announcement published successfully");
        if (onSuccess) onSuccess();
      } else {
        toast.error(`Failed to publish: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Enter announcement title" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" {...register("content")} placeholder="Detailed announcement content" className="min-h-[100px]" />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Audience</Label>
          <Select onValueChange={(val) => setValue("audience", val as any)} defaultValue={audience}>
            <SelectTrigger>
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="students">All Students</SelectItem>
              <SelectItem value="faculty">All Faculty</SelectItem>
              <SelectItem value="department">Specific Department</SelectItem>
              <SelectItem value="section">Specific Section</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select onValueChange={(val) => setValue("priority", val as any)} defaultValue="normal">
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(audience === "department" || audience === "section") && (
        <div className="space-y-2">
          <Label htmlFor="department_id">Department ID</Label>
          <Input id="department_id" {...register("department_id")} placeholder="Enter valid UUID" />
          {errors.department_id && <p className="text-sm text-destructive">{errors.department_id.message}</p>}
        </div>
      )}

      {audience === "section" && (
        <div className="space-y-2">
          <Label htmlFor="section_id">Section ID</Label>
          <Input id="section_id" {...register("section_id")} placeholder="Enter valid UUID" />
          {errors.section_id && <p className="text-sm text-destructive">{errors.section_id.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="attachment_url">Attachment URL (Optional)</Label>
        <Input id="attachment_url" {...register("attachment_url")} placeholder="https://..." />
        {errors.attachment_url && <p className="text-sm text-destructive">{errors.attachment_url.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="publish_at">Publish At (Optional)</Label>
          <Input id="publish_at" type="datetime-local" {...register("publish_at")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expires_at">Expires At (Optional)</Label>
          <Input id="expires_at" type="datetime-local" {...register("expires_at")} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Publish Announcement
      </Button>
    </form>
  );
}
