import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Bell } from "lucide-react";

export default async function HodNotificationsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "hod") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: hodFaculty } = await (supabase as any)
    .from("faculty")
    .select("department_id")
    .eq("profile_id", profile.id)
    .single();

  if (!hodFaculty?.department_id) {
    return <div>No department assigned</div>;
  }

  const { data: notices } = await (supabase as any)
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Department Notices</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>Recent notices broadcasted to the department and college.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {notices?.map((notice: any) => (
              <div key={notice.id} className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium leading-none">{notice.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {format(new Date(notice.created_at), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {notice.content}
                  </p>
                </div>
              </div>
            ))}
            {(!notices || notices.length === 0) && (
              <div className="text-center text-muted-foreground py-12">
                No notices available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
