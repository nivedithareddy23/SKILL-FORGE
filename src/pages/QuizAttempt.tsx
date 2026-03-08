import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  sort_order: number | null;
}

export default function QuizAttempt() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId || !user) return;
    const load = async () => {
      const { data: q } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
      if (!q) { navigate("/quizzes"); return; }
      setQuiz(q);
      setTimeLeft((q.time_limit_minutes || 30) * 60);

      const { data: qs } = await supabase.from("questions").select("*").eq("quiz_id", quizId).order("sort_order");
      const mapped = (qs || []).map(qq => ({
        ...qq,
        options: Array.isArray(qq.options) ? (qq.options as string[]) : [],
      }));
      setQuestions(mapped);

      // Create attempt
      const { data: att } = await supabase.from("quiz_attempts").insert({
        quiz_id: quizId,
        student_id: user.id,
      }).select().single();
      if (att) setAttemptId(att.id);
    };
    load();
  }, [quizId, user, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft > 0]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    await supabase.from("quiz_attempts").update({
      answers,
      score,
      completed_at: new Date().toISOString(),
    }).eq("id", attemptId);

    toast.success(`Quiz submitted! Score: ${score}%`);
    navigate(`/quiz/${quizId}/result/${attemptId}`);
  }, [attemptId, answers, questions, submitting, quizId, navigate]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const currentQ = questions[currentIdx];

  if (!quiz || questions.length === 0) {
    return <DashboardLayout><p className="text-muted-foreground animate-fade-in">Loading quiz...</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">{quiz.title}</h1>
          <div className={cn("flex items-center gap-2 rounded-lg px-4 py-2 font-display font-semibold text-sm",
            timeLeft < 60 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                "h-3 w-3 rounded-full transition-all",
                i === currentIdx ? "bg-primary scale-125" :
                answers[questions[i].id] ? "bg-primary/40" : "bg-muted"
              )}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">
              <span className="text-primary mr-2">Q{currentIdx + 1}/{questions.length}</span>
              {currentQ.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                className={cn(
                  "w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-all",
                  answers[currentQ.id] === opt
                    ? "border-primary bg-primary/5 text-foreground font-medium"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-display font-semibold mr-2 text-primary">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          {currentIdx === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              <Send className="mr-2 h-4 w-4" /> Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
