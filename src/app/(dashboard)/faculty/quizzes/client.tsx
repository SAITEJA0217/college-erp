"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createQuiz } from "@/features/quizzes/actions";
import { toast } from "sonner";
import { Loader2, Plus, BrainCircuit, CalendarClock, Users, Trash2, SwitchCamera, Clock, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function FacultyQuizzesClient({ 
  facultyId, 
  subjects, 
  initialQuizzes 
}: { 
  facultyId: string; 
  subjects: any[]; 
  initialQuizzes: any[];
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Questions State
  const [questions, setQuestions] = useState<any[]>([]);

  const addQuestion = (type: 'MCQ' | 'TrueFalse' | 'ShortAnswer') => {
    setQuestions([...questions, {
      id: Math.random().toString(),
      question_text: "",
      question_type: type,
      options: type === 'MCQ' ? ["", "", "", ""] : (type === 'TrueFalse' ? ["True", "False"] : []),
      correct_answer: "",
      points: 1
    }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...questions];
    newQs[qIndex].options[optIndex] = value;
    setQuestions(newQs);
  };

  const removeQuestion = (index: number) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title || !startTime || !endTime) {
      toast.error("Please fill all required quiz settings");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate questions
    for (const [i, q] of questions.entries()) {
      if (!q.question_text) return toast.error(`Question ${i+1} is missing text`);
      if (!q.correct_answer) return toast.error(`Question ${i+1} is missing a correct answer`);
      if (q.question_type === 'MCQ' && q.options.some((o: string) => !o)) {
        return toast.error(`Question ${i+1} is missing MCQ options`);
      }
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("faculty_id", facultyId);
    formData.append("subject_id", subjectId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("time_limit_minutes", timeLimit);
    
    // Convert to ISO with local timezone applied by the browser date input
    formData.append("start_time", new Date(startTime).toISOString());
    formData.append("end_time", new Date(endTime).toISOString());
    formData.append("is_published", String(isPublished));

    const result = await createQuiz(formData, questions);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Quiz created successfully!");
      setIsAddOpen(false);
      window.location.reload(); 
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Card className="px-4 py-2 flex flex-col justify-center bg-primary/5 border-primary/20">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Quizzes</span>
            <span className="text-2xl font-bold">{initialQuizzes.length}</span>
          </Card>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Create Quiz</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 pt-4">
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-semibold">Quiz Settings</h3>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select subject...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Quiz Title *</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unit 1 Pop Quiz" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Brief instructions..." 
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Time Limit (mins) *</Label>
                    <Input required type="number" min="1" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Window *</Label>
                    <Input required type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Window *</Label>
                    <Input required type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="published" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded border-input" />
                  <Label htmlFor="published">Publish Immediately</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Questions ({questions.length})</h3>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('MCQ')}>+ MCQ</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('TrueFalse')}>+ T/F</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('ShortAnswer')}>+ Short Answer</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <Card key={q.id} className="relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeQuestion(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex gap-4">
                          <span className="font-bold text-muted-foreground w-6">{i+1}.</span>
                          <div className="flex-1 space-y-2">
                            <Label>Question Text</Label>
                            <Input value={q.question_text} onChange={e => updateQuestion(i, 'question_text', e.target.value)} placeholder="Enter question..." />
                          </div>
                          <div className="space-y-2 w-24">
                            <Label>Points</Label>
                            <Input type="number" min="1" value={q.points} onChange={e => updateQuestion(i, 'points', parseInt(e.target.value))} />
                          </div>
                        </div>

                        <div className="pl-10 space-y-3">
                          {q.question_type === 'MCQ' && (
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt: string, optIdx: number) => (
                                <Input key={optIdx} value={opt} onChange={e => updateOption(i, optIdx, e.target.value)} placeholder={`Option ${optIdx+1}`} />
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="text-primary">Correct Answer *</Label>
                            {q.question_type === 'MCQ' ? (
                              <select required value={q.correct_answer} onChange={e => updateQuestion(i, 'correct_answer', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                                <option value="">Select correct option...</option>
                                {q.options.filter((o: string) => o).map((opt: string, optIdx: number) => (
                                  <option key={optIdx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : q.question_type === 'TrueFalse' ? (
                              <select required value={q.correct_answer} onChange={e => updateQuestion(i, 'correct_answer', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                                <option value="">Select true/false...</option>
                                <option value="True">True</option>
                                <option value="False">False</option>
                              </select>
                            ) : (
                              <Input value={q.correct_answer} onChange={e => updateQuestion(i, 'correct_answer', e.target.value)} placeholder="Exact answer (case-insensitive)" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploading ? "Saving Quiz..." : "Save Quiz"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {initialQuizzes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
          <BrainCircuit className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No quizzes created</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">Create interactive quizzes to test student knowledge.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialQuizzes.map(q => {
            const now = new Date();
            const start = new Date(q.start_time);
            const end = new Date(q.end_time);
            let status = "Upcoming";
            if (now > end) status = "Closed";
            else if (now >= start && now <= end) status = "Active";

            return (
              <Card key={q.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={status === "Active" ? "default" : status === "Closed" ? "secondary" : "outline"}>
                      {status}
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center">
                      <Clock className="w-3 h-3 mr-1"/> {q.time_limit_minutes}m
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg leading-tight mb-1">{q.title}</h3>
                  <div className="text-xs font-medium text-primary mb-4">{q.subject_code} - {q.subject_name}</div>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                      {format(parseISO(q.start_time), "MMM d, h:mm a")} - {format(parseISO(q.end_time), "h:mm a")}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-3">
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        {q.attempts_count} Attempts
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        {q.questions_count} Qs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
