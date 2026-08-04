import { AdminDashboardClient } from "./client";

export default function AdminPage() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Analytics</h2>
        <p className="text-muted-foreground mt-1">College-wide metrics, enrollment, attendance, placements, and revenue.</p>
      </div>
      <AdminDashboardClient />
    </div>
  );
}
