"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/features/placement/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

export function ApplicationsClient({ 
  drives, 
  initialApplications,
  selectedDriveId
}: { 
  drives: any[],
  initialApplications: any[],
  selectedDriveId?: string
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleDriveChange(val: string) {
    router.push(`/placement/applications?driveId=${val}`);
  }

  async function handleStatusChange(appId: string, status: string) {
    setLoadingId(appId);
    await updateApplicationStatus(appId, status);
    setLoadingId(null);
    router.refresh();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'default';
      case 'shortlisted': return 'secondary';
      case 'interviewed': return 'outline';
      case 'selected': return 'default'; // Maybe custom green
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select a Campus Drive</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedDriveId || ""} 
            onValueChange={handleDriveChange}
          >
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Select a drive to view applications" />
            </SelectTrigger>
            <SelectContent>
              {drives.map(drive => (
                <SelectItem key={drive.id} value={drive.id}>
                  {drive.company_name} - {drive.job_role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDriveId && (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Applied At</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.students.users.full_name}</TableCell>
                  <TableCell>{app.students.users.email}</TableCell>
                  <TableCell>{app.students.current_cgpa}</TableCell>
                  <TableCell>{format(new Date(app.applied_at), "PPp")}</TableCell>
                  <TableCell>
                    {app.resume_url ? (
                      <a href={app.resume_url} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                        View <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(app.status) as any}>
                      {app.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      disabled={loadingId === app.id}
                      defaultValue={app.status}
                      onValueChange={(val: string) => handleStatusChange(app.id, val)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {initialApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No applications received for this drive yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
