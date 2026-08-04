"use client";

import { useState } from "react";
import { applyToPlacement } from "@/features/placement/actions";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, MapPin, DollarSign, GraduationCap } from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

export function StudentPlacementsClient({ 
  placements,
  studentId
}: { 
  placements: any[],
  studentId: string
}) {
  const [selectedPlacement, setSelectedPlacement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const supabase = createClient();

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedPlacement) return;

    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}/${selectedPlacement.id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const res = await applyToPlacement(selectedPlacement.id, studentId, publicUrl);
      if (res.error) throw new Error(res.error);

      toast.success("Application submitted successfully!");
      setSelectedPlacement(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'default';
      case 'shortlisted': return 'secondary';
      case 'interviewed': return 'outline';
      case 'selected': return 'default';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {placements.map((drive) => {
        const isClosed = isPast(new Date(drive.application_deadline));
        const hasApplied = !!drive.application;

        return (
          <Card key={drive.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{drive.company_name}</CardTitle>
                  <CardDescription>{drive.job_role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="outline">{drive.placement_type === 'internship' ? 'Internship' : 'Full-Time'}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{drive.ctc || "Not Disclosed"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{drive.locations || "Multiple"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>Min CGPA: {drive.eligibility_cgpa}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {format(new Date(drive.application_deadline), "PPP")}</span>
                </div>
              </div>
              
              {hasApplied && (
                <div className="p-3 bg-muted rounded-md flex items-center justify-between border">
                  <span className="text-sm font-medium">Application Status</span>
                  <Badge variant={getStatusColor(drive.application.status) as any}>
                    {drive.application.status.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!hasApplied ? (
                <Dialog open={selectedPlacement?.id === drive.id} onOpenChange={(open) => !open && setSelectedPlacement(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={isClosed}
                      onClick={() => setSelectedPlacement(drive)}
                    >
                      {isClosed ? "Applications Closed" : "Apply Now"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to {drive.company_name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Upload Resume (PDF)</Label>
                        <Input 
                          type="file" 
                          accept=".pdf" 
                          required 
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Please ensure your resume is up to date and in PDF format.
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading || !file}>
                        {loading ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="secondary" className="w-full" disabled>
                  Already Applied
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
      
      {placements.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          No campus drives available at the moment.
        </div>
      )}
    </div>
  );
}
