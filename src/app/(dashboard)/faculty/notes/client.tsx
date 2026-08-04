"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createNote, deleteNote } from "@/features/notes/actions";
import { toast } from "sonner";
import { Loader2, Plus, File, Image as ImageIcon, Link as LinkIcon, Trash2, FileText, PlayCircle, FileArchive, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

export function FacultyNotesClient({ 
  facultyId, 
  subjects, 
  initialNotes 
}: { 
  facultyId: string; 
  subjects: any[]; 
  initialNotes: any[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [resourceType, setResourceType] = useState("pdf");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title) {
      toast.error("Subject and Title are required");
      return;
    }

    const requiresFile = ["pdf", "ppt", "docx", "zip", "image"].includes(resourceType);
    if (requiresFile && !file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!requiresFile && !url) {
      toast.error("Please provide a valid URL");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("faculty_id", facultyId);
    formData.append("subject_id", subjectId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("unit", unit);
    formData.append("resource_type", resourceType);
    if (url) formData.append("url", url);
    if (file) formData.append("file", file);

    const result = await createNote(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Study material uploaded successfully!");
      setIsAddOpen(false);
      // Let server component handle fresh data on reload, but we can just reload for simplicity
      window.location.reload(); 
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    const result = await deleteNote(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Material deleted");
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
      case "ppt": return <File className="h-5 w-5 text-orange-500" />;
      case "docx": return <FileText className="h-5 w-5 text-blue-500" />;
      case "zip": return <FileArchive className="h-5 w-5 text-yellow-500" />;
      case "image": return <ImageIcon className="h-5 w-5 text-green-500" />;
      case "youtube": return <PlayCircle className="h-5 w-5 text-red-600" />;
      default: return <LinkIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Uploads</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Upload Material</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Study Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 1 Notes" />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the material" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit / Module</Label>
                  <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. Unit 1" />
                </div>
                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <select required value={resourceType} onChange={e => setResourceType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PowerPoint (PPT)</option>
                    <option value="docx">Word Document</option>
                    <option value="zip">ZIP Archive</option>
                    <option value="image">Image</option>
                    <option value="youtube">YouTube Video</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
              </div>
              
              {["link", "youtube"].includes(resourceType) ? (
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input required type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>File Upload (Max 50MB)</Label>
                  <Input required type="file" onChange={handleFileChange} />
                </div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploading ? "Uploading..." : "Upload Material"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
          <File className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No materials uploaded yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">Upload your first study material to share with students.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map(note => (
            <Card key={note.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md text-xs font-semibold uppercase">
                    {getIcon(note.resource_type)}
                    <span>{note.resource_type}</span>
                  </div>
                  {note.unit && <Badge variant="outline">{note.unit}</Badge>}
                </div>
                
                <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2" title={note.title}>{note.title}</h3>
                <div className="text-xs font-medium text-primary mb-2">{note.subject_code} - {note.subject_name}</div>
                
                {note.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {note.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{format(parseISO(note.created_at), "MMM d, yyyy")}</span>
                  <div className="flex gap-2">
                    <a href={note.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8">
                      <Download className="h-4 w-4" />
                    </a>
                    <button onClick={() => handleDelete(note.id)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-destructive/10 text-destructive h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
