"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, Image as ImageIcon, Link as LinkIcon, FileText, PlayCircle, FileArchive, Download, Search, ExternalLink, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { deleteNote } from "@/features/notes/actions";

export function AdminNotesClient({ initialNotes }: { initialNotes: any[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");

  const faculties = Array.from(new Set(initialNotes.map(n => n.faculty_name))).filter(Boolean);

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          (n.subject_name && n.subject_name.toLowerCase().includes(search.toLowerCase()));
    const matchesFaculty = facultyFilter ? n.faculty_name === facultyFilter : true;
    return matchesSearch && matchesFaculty;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to forcibly delete this material? This cannot be undone.")) return;
    const result = await deleteNote(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Material deleted permanently");
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials by title or subject..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[250px]">
              <select 
                value={facultyFilter} 
                onChange={e => setFacultyFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Faculty</option>
                {faculties.map((f: any) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className="flex flex-col h-full">
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
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{note.faculty_name}</span>
                  <span className="text-xs text-muted-foreground">{format(parseISO(note.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex gap-2">
                  <a href={note.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
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
    </div>
  );
}
