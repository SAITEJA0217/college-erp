"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, BookOpen, GraduationCap, Building2, Network, Users, CalendarDays, BrainCircuit } from "lucide-react";
import { submitSetupWizard, SetupWizardPayload } from "@/features/admin/academic-actions";

export function SetupWizardClient({
  initialSchools,
  initialDepartments,
  initialPrograms,
  initialAcademicYears,
  initialSections,
  initialSubjects,
  initialFaculty
}: any) {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [payload, setPayload] = useState<SetupWizardPayload>({
    school: { mode: "select" },
    department: { mode: "select" },
    program: { mode: "select" },
    academic_year: { mode: "select" },
    section: { mode: "select" },
    subject: { mode: "select" },
    faculty: { mode: "select" },
    timetable: { day_of_week: "Monday", start_time: "09:00", end_time: "10:00", room_number: "" }
  } as any);

  // Load Draft
  useEffect(() => {
    const draft = localStorage.getItem("academix_wizard_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.payload) setPayload(parsed.payload);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      } catch (e) {}
    }
  }, []);

  // Save Draft
  useEffect(() => {
    if (!isSuccess) {
      localStorage.setItem("academix_wizard_draft", JSON.stringify({ payload, currentStep }));
    } else {
      localStorage.removeItem("academix_wizard_draft");
    }
  }, [payload, currentStep, isSuccess]);

  const updatePayload = (key: keyof SetupWizardPayload, data: any) => {
    setPayload(p => ({ ...p, [key]: data }));
  };

  // Filtered lists for dropdowns (using temporary IDs or names if created newly? Wait, if they create new, they don't have an ID yet. We can just show what they typed in the next step, or disable dropdown if parent is new)
  // Actually, if parent is "new", we can't filter existing children. So if parent is "new", we should force child to also be "new" or just hide the select existing option.
  const parentSchoolId = payload.school.mode === "select" ? payload.school.id : null;
  const filteredDepartments = parentSchoolId ? initialDepartments?.filter((d: any) => d.school_id === parentSchoolId) : initialDepartments;
  
  const parentDeptId = payload.department.mode === "select" ? payload.department.id : null;
  const filteredPrograms = parentDeptId ? initialPrograms?.filter((p: any) => p.department_id === parentDeptId) : initialPrograms;
  
  const parentProgId = payload.program.mode === "select" ? payload.program.id : null;
  const parentYearId = payload.academic_year.mode === "select" ? payload.academic_year.id : null;
  const filteredSections = (parentProgId && parentYearId) ? initialSections?.filter((s: any) => s.program_id === parentProgId && s.academic_year_id === parentYearId) : initialSections;

  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await submitSetupWizard(payload);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.error, { duration: 5000 });
    } else {
      setIsSuccess(true);
      setCurrentStep(8);
      toast.success("Setup Complete!");
    }
  };

  const steps = [
    { id: 1, name: "School", icon: Building2 },
    { id: 2, name: "Department", icon: Network },
    { id: 3, name: "Program", icon: GraduationCap },
    { id: 4, name: "Academic Year", icon: CalendarDays },
    { id: 5, name: "Section", icon: Users },
    { id: 6, name: "Subject", icon: BookOpen },
    { id: 7, name: "Faculty & Assignment", icon: BrainCircuit },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="text-lg font-bold mb-4">Setup Progress</h2>
          <div className="space-y-4">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className={`flex items-center gap-3 ${isCompleted ? 'text-primary' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                      isCurrent ? 'border-primary text-primary' : 'border-muted-foreground/30'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm">{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-2xl text-primary">
              <BrainCircuit className="w-6 h-6" /> 
              Academix Guided Setup
            </CardTitle>
            <CardDescription>
              Complete the academic hierarchy in a single, guided workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            
            {currentStep === 1 && (
              <StepSchool 
                schools={initialSchools} 
                data={payload.school} 
                onChange={(d:any) => updatePayload("school", d)}
                onNext={() => setCurrentStep(2)} 
              />
            )}

            {currentStep === 2 && (
              <StepDepartment 
                departments={filteredDepartments} 
                forceNew={payload.school.mode === "new"}
                data={payload.department} 
                onChange={(d:any) => updatePayload("department", d)}
                onNext={() => setCurrentStep(3)} 
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <StepProgram 
                programs={filteredPrograms} 
                forceNew={payload.department.mode === "new"}
                data={payload.program} 
                onChange={(d:any) => updatePayload("program", d)}
                onNext={() => setCurrentStep(4)} 
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <StepAcademicYear 
                academicYears={initialAcademicYears} 
                data={payload.academic_year} 
                onChange={(d:any) => updatePayload("academic_year", d)}
                onNext={() => setCurrentStep(5)} 
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <StepSection 
                sections={filteredSections} 
                forceNew={payload.program.mode === "new" || payload.academic_year.mode === "new"}
                data={payload.section} 
                onChange={(d:any) => updatePayload("section", d)}
                onNext={() => setCurrentStep(6)} 
                onBack={() => setCurrentStep(4)}
              />
            )}

            {currentStep === 6 && (
              <StepSubject 
                subjects={initialSubjects} 
                forceNew={payload.department.mode === "new"}
                data={payload.subject} 
                onChange={(d:any) => updatePayload("subject", d)}
                onNext={() => setCurrentStep(7)} 
                onBack={() => setCurrentStep(5)}
              />
            )}

            {currentStep === 7 && (
              <StepFaculty 
                faculty={initialFaculty}
                forceNew={payload.department.mode === "new"}
                data={payload.faculty}
                timetable={payload.timetable}
                onChange={(f:any, t:any) => {
                  updatePayload("faculty", f);
                  updatePayload("timetable", t);
                }}
                onComplete={handleSubmit} 
                onBack={() => setCurrentStep(6)}
                loading={isLoading}
              />
            )}

            {currentStep === 8 && isSuccess && (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold">Setup Completed Successfully!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  The academic structure, faculty assignments, and timetable have been generated securely.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> School Configured</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Department Linked</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Program & Year</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Section & Subject</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Faculty Assigned</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Timetable Live</div>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <Button onClick={() => router.push("/admin/timetable")}>View Timetable</Button>
                  <Button variant="outline" onClick={() => router.push("/admin")}>Go to Dashboard</Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sub-components for each step
function StepSchool({ schools, data, onChange, onNext }: any) {
  const mode = data.mode || "select";
  const handleNext = () => {
    if (mode === "select" && !data.id) return toast.error("Please select a school.");
    if (mode === "new" && (!data.values?.name || !data.values?.code)) return toast.error("Please fill all fields.");
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">1. Select or Create School</h3>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} onClick={() => onChange({...data, mode: "select"})}>Select Existing</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"})}>Create New</Button>
      </div>

      {mode === "select" ? (
        <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val})}>
          <SelectTrigger><SelectValue placeholder="Select a school" /></SelectTrigger>
          <SelectContent>
            {schools?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">School Code</label>
            <Input value={data.values?.code || ""} onChange={e => onChange({...data, values: {...data.values, code: e.target.value}})} placeholder="e.g., SOE" />
          </div>
          <div>
            <label className="text-sm font-medium">School Name</label>
            <Input value={data.values?.name || ""} onChange={e => onChange({...data, values: {...data.values, name: e.target.value}})} placeholder="e.g., School of Engineering" />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext}>Continue to Department <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
}

function StepDepartment({ departments, forceNew, data, onChange, onNext, onBack }: any) {
  const mode = forceNew ? "new" : (data.mode || "select");
  const handleNext = () => {
    if (mode === "select" && !data.id) return toast.error("Please select a department.");
    if (mode === "new" && (!data.values?.name || !data.values?.code)) return toast.error("Please fill all fields.");
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">2. Select or Create Department</h3>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} disabled={forceNew} onClick={() => onChange({...data, mode: "select"})}>Select Existing</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"})}>Create New</Button>
      </div>

      {mode === "select" ? (
        <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val})}>
          <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
          <SelectContent>
            {departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.code} - {d.name}</SelectItem>)}
            {departments?.length === 0 && <SelectItem value="none" disabled>No departments found.</SelectItem>}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Department Code</label>
            <Input value={data.values?.code || ""} onChange={e => onChange({...data, values: {...data.values, code: e.target.value}})} placeholder="e.g., CSE" />
          </div>
          <div>
            <label className="text-sm font-medium">Department Name</label>
            <Input value={data.values?.name || ""} onChange={e => onChange({...data, values: {...data.values, name: e.target.value}})} placeholder="e.g., Computer Science" />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue to Program <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
}

function StepProgram({ programs, forceNew, data, onChange, onNext, onBack }: any) {
  const mode = forceNew ? "new" : (data.mode || "select");
  const handleNext = () => {
    if (mode === "select" && !data.id) return toast.error("Please select a program.");
    if (mode === "new" && (!data.values?.name || !data.values?.code || !data.values?.duration)) return toast.error("Please fill all fields.");
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">3. Select or Create Program</h3>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} disabled={forceNew} onClick={() => onChange({...data, mode: "select"})}>Select Existing</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"})}>Create New</Button>
      </div>

      {mode === "select" ? (
        <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val})}>
          <SelectTrigger><SelectValue placeholder="Select a program" /></SelectTrigger>
          <SelectContent>
            {programs?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}
            {programs?.length === 0 && <SelectItem value="none" disabled>No programs found.</SelectItem>}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Program Code</label>
            <Input value={data.values?.code || ""} onChange={e => onChange({...data, values: {...data.values, code: e.target.value}})} placeholder="e.g., BTECH-CSE" />
          </div>
          <div>
            <label className="text-sm font-medium">Program Name</label>
            <Input value={data.values?.name || ""} onChange={e => onChange({...data, values: {...data.values, name: e.target.value}})} placeholder="e.g., B.Tech in CSE" />
          </div>
          <div>
            <label className="text-sm font-medium">Duration (Years)</label>
            <Input type="number" value={data.values?.duration || 4} onChange={e => onChange({...data, values: {...data.values, duration: parseInt(e.target.value)}})} />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue to Year <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
}

function StepAcademicYear({ academicYears, data, onChange, onNext, onBack }: any) {
  const mode = data.mode || "select";
  const handleNext = () => {
    if (mode === "select" && !data.id) return toast.error("Please select an academic year.");
    if (mode === "new" && !data.values?.name) return toast.error("Please enter a name.");
    
    // Auto populate dates for new year
    if (mode === "new") {
      const yearStr = data.values.name;
      data.values.start_date = `${yearStr.substring(0,4)}-07-01`;
      data.values.end_date = `${yearStr.substring(5,9)}-06-30`;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">4. Select Academic Year</h3>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} onClick={() => onChange({...data, mode: "select"})}>Select Existing</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"})}>Create New</Button>
      </div>

      {mode === "select" ? (
        <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val})}>
          <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
          <SelectContent>
            {academicYears?.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Year Name</label>
            <Input value={data.values?.name || ""} onChange={e => onChange({...data, values: {...data.values, name: e.target.value}})} placeholder="e.g., 2026-2027" />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue to Section <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
}

function StepSection({ sections, forceNew, data, onChange, onNext, onBack }: any) {
  const mode = forceNew ? "new" : (data.mode || "select");
  const handleNext = () => {
    if (mode === "select" && !data.id) return toast.error("Please select a section.");
    if (mode === "new" && !data.values?.name) return toast.error("Please fill all fields.");
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">5. Select or Create Section</h3>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} disabled={forceNew} onClick={() => onChange({...data, mode: "select"})}>Select Existing</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"})}>Create New</Button>
      </div>

      {mode === "select" ? (
        <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val})}>
          <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
          <SelectContent>
            {sections?.map((s: any) => <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>)}
            {sections?.length === 0 && <SelectItem value="none" disabled>No sections found.</SelectItem>}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Section Name</label>
            <Input value={data.values?.name || ""} onChange={e => onChange({...data, values: {...data.values, name: e.target.value}})} placeholder="e.g., A" />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue to Subject <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
}

function StepSubject({ subjects, forceNew, data, onChange, onNext, onBack }: any) {
  const mode = forceNew ? "new" : (data.mode || "select");
  const handleNext = () => {
    if (mode === "select" && !data.id) return toast.error("Please select a subject.");
    if (mode === "new" && (!data.values?.name || !data.values?.code)) return toast.error("Please fill all fields.");
    if (mode === "new" && !data.values?.credits) data.values.credits = 3;
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">6. Select or Create Subject</h3>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} disabled={forceNew} onClick={() => onChange({...data, mode: "select"})}>Select Existing</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"})}>Create New</Button>
      </div>

      {mode === "select" ? (
        <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val})}>
          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
          <SelectContent>
            {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>)}
            {subjects?.length === 0 && <SelectItem value="none" disabled>No subjects found.</SelectItem>}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject Code</label>
            <Input value={data.values?.code || ""} onChange={e => onChange({...data, values: {...data.values, code: e.target.value}})} placeholder="e.g., CS101" />
          </div>
          <div>
            <label className="text-sm font-medium">Subject Name</label>
            <Input value={data.values?.name || ""} onChange={e => onChange({...data, values: {...data.values, name: e.target.value}})} placeholder="e.g., Intro to Programming" />
          </div>
          <div>
            <label className="text-sm font-medium">Credits</label>
            <Input type="number" value={data.values?.credits || 3} onChange={e => onChange({...data, values: {...data.values, credits: parseInt(e.target.value)}})} />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue to Faculty <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
}

function StepFaculty({ faculty, forceNew, data, timetable, onChange, onComplete, onBack, loading }: any) {
  const mode = forceNew ? "new" : (data.mode || "select");

  const handleComplete = () => {
    if (mode === "select" && !data.id) return toast.error("Please select a faculty member.");
    if (mode === "new" && (!data.values?.full_name || !data.values?.email || !data.values?.employee_or_student_id)) {
      return toast.error("Please fill required faculty fields.");
    }
    if (mode === "new" && !data.values?.designation) data.values.designation = "Assistant Professor";
    onComplete();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">7. Assign Faculty & Generate Timetable</h3>
        <p className="text-sm text-muted-foreground">Select an existing faculty or create a new one, then assign them to the subject and auto-generate their timetable entry.</p>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button variant={mode === "select" ? "default" : "outline"} disabled={forceNew} onClick={() => onChange({...data, mode: "select"}, timetable)}>Select Existing Faculty</Button>
        <Button variant={mode === "new" ? "default" : "outline"} onClick={() => onChange({...data, mode: "new"}, timetable)}>Create New Faculty</Button>
      </div>

      <div className="p-4 border rounded-md bg-card space-y-4">
        {mode === "select" ? (
          <div>
            <label className="text-sm font-medium mb-1 block">Faculty Member</label>
            <Select value={data.id || ""} onValueChange={(val) => onChange({...data, id: val}, timetable)}>
              <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
              <SelectContent>
                {faculty?.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.full_name} ({f.employee_or_student_id})</SelectItem>)}
                {faculty?.length === 0 && <SelectItem value="none" disabled>No faculty found.</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block">Full Name *</label>
              <Input value={data.values?.full_name || ""} onChange={e => onChange({...data, values: {...data.values, full_name: e.target.value}}, timetable)} placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium block">Email *</label>
              <Input value={data.values?.email || ""} type="email" onChange={e => onChange({...data, values: {...data.values, email: e.target.value}}, timetable)} placeholder="john@academix.edu" />
            </div>
            <div>
              <label className="text-sm font-medium block">Employee ID *</label>
              <Input value={data.values?.employee_or_student_id || ""} onChange={e => onChange({...data, values: {...data.values, employee_or_student_id: e.target.value}}, timetable)} placeholder="EMP101" />
            </div>
            <div>
              <label className="text-sm font-medium block">Phone</label>
              <Input value={data.values?.phone || ""} onChange={e => onChange({...data, values: {...data.values, phone: e.target.value}}, timetable)} placeholder="+1 234..." />
            </div>
          </div>
        )}

        <hr className="my-4" />
        
        <h4 className="font-semibold text-sm">Timetable Configuration (Auto-Generated)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block">Day of Week</label>
            <Select value={timetable.day_of_week} onValueChange={(val) => onChange(data, {...timetable, day_of_week: val})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block">Room Number</label>
            <Input value={timetable.room_number || ""} onChange={e => onChange(data, {...timetable, room_number: e.target.value})} placeholder="e.g., Room 101" />
          </div>
          <div>
            <label className="text-sm font-medium block">Start Time</label>
            <Input type="time" value={timetable.start_time} onChange={e => onChange(data, {...timetable, start_time: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block">End Time</label>
            <Input type="time" value={timetable.end_time} onChange={e => onChange(data, {...timetable, end_time: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleComplete} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
          {loading ? "Saving Setup..." : "Complete Setup & Generate"} <CheckCircle2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
