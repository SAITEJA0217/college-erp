"use client";

import { useState, useMemo } from "react";
import { AssignedClass, FacultyProfileInfo } from "@/features/faculty/types";
import { ClassesEmptyState } from "./empty-state";
import { ClassDetailsModal } from "./class-details-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter, SlidersHorizontal, User, BookOpen, LayoutGrid, Clock, CalendarDays } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClassesClientProps {
  initialClasses: AssignedClass[];
  profileInfo: FacultyProfileInfo | null;
}

export function ClassesClient({ initialClasses, profileInfo }: ClassesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<AssignedClass | null>(null);

  // Derive filter options dynamically
  const semesters = useMemo(() => Array.from(new Set(initialClasses.map(c => c.semester_number.toString()))).sort(), [initialClasses]);
  
  // Apply Search and Filters
  const filteredClasses = useMemo(() => {
    return initialClasses.filter(c => {
      const matchesSearch = 
        c.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.section_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || c.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSemester = selectedSemester === "all" || c.semester_number.toString() === selectedSemester;

      return matchesSearch && matchesStatus && matchesSemester;
    });
  }, [initialClasses, searchQuery, selectedStatus, selectedSemester]);

  // Aggregate Stats
  const totalSubjects = new Set(initialClasses.map(c => c.subject_code)).size;
  const totalSections = initialClasses.length;
  const weeklyHours = initialClasses.reduce((acc, c) => acc + c.weekly_hours, 0);
  const currentSemester = semesters.length > 0 ? semesters[semesters.length - 1] : "N/A";

  if (initialClasses.length === 0) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <FacultyInfoCard profileInfo={profileInfo} />
        <ClassesEmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Subjects" value={totalSubjects} icon={<BookOpen className="w-4 h-4 text-primary" />} />
        <StatCard title="Total Sections" value={totalSections} icon={<LayoutGrid className="w-4 h-4 text-blue-500" />} />
        <StatCard title="Weekly Hours" value={weeklyHours} icon={<Clock className="w-4 h-4 text-orange-500" />} />
        <StatCard title="Current Sem" value={currentSemester} icon={<CalendarDays className="w-4 h-4 text-green-500" />} />
      </div>

      {/* Faculty Profile Summary */}
      <FacultyInfoCard profileInfo={profileInfo} />

      {/* Main Content Area */}
      <div className="flex flex-col border rounded-xl bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by code, subject, or section..."
              className="pl-9 bg-background w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map(sem => (
                  <SelectItem key={sem} value={sem}>Sem {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="hidden md:table-cell">Dept</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Sem</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Hours</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-mono text-xs">{cls.subject_code}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={cls.subject_name}>
                      {cls.subject_name}
                    </TableCell>
                    <TableCell>{cls.section_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{cls.department_name}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center">{cls.semester_number}</TableCell>
                    <TableCell className="hidden xl:table-cell text-center font-medium">{cls.weekly_hours}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cls.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                        {cls.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => setSelectedClass(cls)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No classes found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ClassDetailsModal 
        cls={selectedClass} 
        faculty={profileInfo}
        open={!!selectedClass} 
        onOpenChange={(open) => !open && setSelectedClass(null)} 
      />
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 bg-muted/50 rounded-md">
          {icon}
        </div>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

function FacultyInfoCard({ profileInfo }: { profileInfo: FacultyProfileInfo | null }) {
  if (!profileInfo) return null;
  return (
    <div className="border rounded-xl p-4 bg-card/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{profileInfo.full_name}</h3>
          <p className="text-xs text-muted-foreground">
            {profileInfo.designation} • {profileInfo.department}
          </p>
        </div>
      </div>
      <Badge variant="outline" className="font-mono bg-background">
        {profileInfo.employee_or_student_id}
      </Badge>
    </div>
  );
}
