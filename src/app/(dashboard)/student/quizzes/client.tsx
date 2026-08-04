"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, PlayCircle, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export function StudentQuizzesClient({ 
  studentId, 
  quizzes 
}: { 
  studentId: string; 
  quizzes: any[];
}) {
  const [activeTab, setActiveTab] = useState("active");

  const now = new Date();
  
  const active = quizzes.filter(q => {
    const start = new Date(q.start_time);
    const end = new Date(q.end_time);
    return !q.attempt?.is_completed && now >= start && now <= end;
  });

  const completed = quizzes.filter(q => q.attempt?.is_completed);

  const missed = quizzes.filter(q => {
    const end = new Date(q.end_time);
    return !q.attempt?.is_completed && now > end;
  });

  const upcoming = quizzes.filter(q => {
    const start = new Date(q.start_time);
    return !q.attempt?.is_completed && now < start;
  });

  const QuizCard = ({ q, status }: { q: any, status: "active" | "completed" | "missed" | "upcoming" }) => {
    const isCompleted = q.attempt?.is_completed;
    
    return (
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
            {status === "active" && <Badge variant="default" className="bg-primary hover:bg-primary/90 flex items-center">Active Now</Badge>}
            {status === "completed" && <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>}
            {status === "missed" && <Badge variant="destructive" className="flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Missed</Badge>}
            {status === "upcoming" && <Badge variant="secondary" className="flex items-center">Upcoming</Badge>}
            
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center">
              <Clock className="w-3 h-3 mr-1"/> {q.time_limit_minutes}m
            </span>
          </div>
          
          <h3 className="font-bold text-lg leading-tight mb-1">{q.title}</h3>
          <div className="text-xs font-medium text-primary mb-3">{q.subject_code} - {q.subject_name}</div>
          
          {q.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {q.description}
            </p>
          )}

          <div className="mt-auto space-y-3">
            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
              <div className="flex flex-col">
                <span className="font-semibold">Window</span>
                <span>{format(parseISO(q.start_time), "MMM d, h:mm a")}</span>
                <span>{format(parseISO(q.end_time), "MMM d, h:mm a")}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-semibold">Questions</span>
                <span>{q.total_questions}</span>
              </div>
            </div>

            {status === "completed" && (
              <div className="bg-primary/5 p-3 rounded-md border border-primary/20 space-y-2 text-center">
                <div className="text-sm font-medium text-muted-foreground">Your Score</div>
                <div className="font-bold text-3xl text-primary">
                  {q.attempt.score} <span className="text-lg text-muted-foreground font-normal">/ {q.total_points}</span>
                </div>
              </div>
            )}

            {status === "active" && (
              <Button asChild className="w-full">
                <Link href={`/student/quizzes/${q.id}/attempt`}>
                  <PlayCircle className="h-4 w-4 mr-2" /> Start Quiz
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({missed.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="pt-6">
          {active.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">No active quizzes right now!</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map(q => <QuizCard key={q.id} q={q} status="active" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="pt-6">
          {upcoming.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">No upcoming quizzes.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(q => <QuizCard key={q.id} q={q} status="upcoming" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="pt-6">
          {completed.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">You haven't completed any quizzes yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map(q => <QuizCard key={q.id} q={q} status="completed" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="missed" className="pt-6">
          {missed.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">You haven't missed any quizzes. Keep it up!</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {missed.map(q => <QuizCard key={q.id} q={q} status="missed" />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
