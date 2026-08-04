"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitQuizAttempt } from "@/features/quizzes/actions";
import { Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuizAttemptClient({ 
  quiz, 
  attempt, 
  questions 
}: { 
  quiz: any; 
  attempt: any; 
  questions: any[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(attempt.is_completed || false);
  const [score, setScore] = useState<number | null>(null);
  const [warningCount, setWarningCount] = useState(0);

  // Calculate remaining time
  const calculateTimeLeft = useCallback(() => {
    const startTimeMs = new Date(attempt.start_time).getTime();
    const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;
    const endTimeMs = startTimeMs + timeLimitMs;
    const nowMs = new Date().getTime();
    return Math.max(0, Math.floor((endTimeMs - nowMs) / 1000));
  }, [attempt.start_time, quiz.time_limit_minutes]);

  useEffect(() => {
    if (isCompleted) return;

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, isCompleted]);

  // Anti-cheating: Tab visibility detection
  useEffect(() => {
    if (isCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => prev + 1);
        toast.warning("Warning: Leaving the quiz tab is not allowed!", {
          duration: 5000,
          icon: <AlertTriangle className="text-destructive" />
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isCompleted]);

  const handleSubmitClick = async () => {
    if (Object.keys(answers).length < questions.length) {
      const confirmSubmit = window.confirm("You have unanswered questions. Are you sure you want to submit?");
      if (!confirmSubmit) return;
    }
    await performSubmit();
  };

  const handleAutoSubmit = async () => {
    toast.error("Time is up! Auto-submitting quiz...");
    await performSubmit();
  };

  const performSubmit = async () => {
    if (isCompleted) return;
    setSubmitting(true);
    
    // Format answers array
    const answersArray = Object.entries(answers).map(([question_id, answer]) => ({
      question_id,
      answer
    }));

    const result = await submitQuizAttempt(attempt.id, answersArray);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setIsCompleted(true);
      setScore(result.score ?? null);
    }
    setSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-muted-foreground mb-8">Your responses have been recorded.</p>
        
        {score !== null && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 inline-block">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Final Score</div>
            <div className="text-5xl font-bold text-primary">{score}</div>
          </div>
        )}

        {warningCount > 0 && (
          <div className="text-sm text-destructive mb-8">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            You were flagged {warningCount} time(s) for leaving the quiz tab.
          </div>
        )}

        <div>
          <Button onClick={() => router.push("/student/quizzes")}>Return to Quizzes</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b rounded-t-xl flex justify-between items-center shadow-sm">
        <div>
          <h1 className="font-bold text-lg">{quiz.title}</h1>
          <div className="text-xs text-muted-foreground">{questions.length} Questions</div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-secondary'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {warningCount > 0 && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm font-medium flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Warning: Tab switching detected ({warningCount}). This has been recorded.
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="font-bold text-lg text-muted-foreground">{index + 1}.</div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-lg">{q.question_text}</p>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md ml-4 whitespace-nowrap">
                      {q.points} Points
                    </span>
                  </div>

                  {q.question_type === 'MCQ' && (
                    <RadioGroup 
                      value={answers[q.id] || ""} 
                      onValueChange={(val: string) => setAnswers(prev => ({...prev, [q.id]: val}))}
                      className="space-y-3"
                    >
                      {q.options?.map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`${q.id}-${optIdx}`} />
                          <Label htmlFor={`${q.id}-${optIdx}`} className="font-normal cursor-pointer text-base">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.question_type === 'TrueFalse' && (
                    <RadioGroup 
                      value={answers[q.id] || ""} 
                      onValueChange={(val: string) => setAnswers(prev => ({...prev, [q.id]: val}))}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="True" id={`${q.id}-true`} />
                        <Label htmlFor={`${q.id}-true`} className="font-normal cursor-pointer text-base">True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="False" id={`${q.id}-false`} />
                        <Label htmlFor={`${q.id}-false`} className="font-normal cursor-pointer text-base">False</Label>
                      </div>
                    </RadioGroup>
                  )}

                  {q.question_type === 'ShortAnswer' && (
                    <Input 
                      placeholder="Type your answer..."
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                      className="max-w-md"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-6 pb-12">
        <Button size="lg" onClick={handleSubmitClick} disabled={submitting} className="w-full sm:w-auto px-12">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}
