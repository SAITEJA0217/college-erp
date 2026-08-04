"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { File, Image as ImageIcon, Link as LinkIcon, FileText, PlayCircle, FileArchive, Download, Search, ExternalLink, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";

export function StudentNotesClient({ initialNotes }: { initialNotes: any[] }) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  // Extract unique subjects and units for filters
  const subjects = Array.from(new Set(initialNotes.map(n => n.subject_name))).filter(Boolean);
  const units = Array.from(new Set(initialNotes.map(n => n.unit))).filter(Boolean);

  const filteredNotes = initialNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          (n.description && n.description.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = subjectFilter ? n.subject_name === subjectFilter : true;
    const matchesUnit = unitFilter ? n.unit === unitFilter : true;
    return matchesSearch && matchesSubject && matchesUnit;
  });

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
                placeholder="Search materials..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={subjectFilter} 
                onChange={e => setSubjectFilter(e.target.value)}
                className="flex h-10 w-full md:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map((s: any) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select 
                value={unitFilter} 
                onChange={e => setUnitFilter(e.target.value)}
                className="flex h-10 w-full md:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Units</option>
                {units.map((u: any) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredNotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No materials found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">Try adjusting your filters or search query.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNotes.map(note => (
            <Card key={note.id} className="flex flex-col h-full hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {note.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{format(parseISO(note.created_at), "MMM d, yyyy")}</span>
                    <span className="text-[10px] text-muted-foreground/70">{note.faculty_name}</span>
                  </div>
                  <a href={note.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 gap-2">
                    {["link", "youtube"].includes(note.resource_type) ? (
                      <><ExternalLink className="h-4 w-4" /> Open</>
                    ) : (
                      <><Download className="h-4 w-4" /> View</>
                    )}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
