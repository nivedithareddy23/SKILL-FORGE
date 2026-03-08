import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizResult() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const [attRes, qRes, quizRes] = await Promise.all([
        supabase.from("quiz_attempts").select("*").eq("id", attemptId!).single(),
        supabase.from("questions").select("*").eq("quiz_id", quizId!).order("sort_order"),
        supabase.from("quizzes").select("*").eq("id", quizId!).single(),
      ]);
      setAttempt(attRes.data);
      setQuestions((qRes.data || []).map(q => ({ ...q, options: Array.isArray(q.options) ? q.options : [] })));
      setQuiz(quizRes.data);
    };
    load();
  }, [quizId, attemptId]);

  if (!attempt || !quiz) {
    return <DashboardLayout><p className="text-muted-foreground">Loading results...</p></DashboardLayout>;
  }

  const answers = (attempt.answers || {}) as Record<string, string>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/quizzes")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Button>

        <Card className={cn("border-2", attempt.score >= 70 ? "border-success/30" : "border-destructive/30")}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{quiz.title}</h1>
              <p className="text-muted-foreground">Quiz Results</p>
            </div>
            <div className="text-center">
              <p className={cn("text-4xl font-display font-bold", attempt.score >= 70 ? "text-success" : "text-destructive")}>
                {attempt.score}%
              </p>
              <Badge variant={attempt.score >= 70 ? "default" : "destructive"}>
                {attempt.score >= 80 ? "Excellent" : attempt.score >= 70 ? "Good" : attempt.score >= 50 ? "Needs Improvement" : "Review Required"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct_answer;
            return (
              <Card key={q.id} className={cn("border-l-4", isCorrect ? "border-l-success" : "border-l-destructive")}>
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    {isCorrect ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    Q{i + 1}. {q.question_text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {q.options.map((opt: string, j: number) => (
                    <p key={j} className={cn(
                      "text-sm rounded-lg px-3 py-1.5",
                      opt === q.correct_answer ? "bg-success/10 text-success font-medium" :
                      opt === userAnswer && !isCorrect ? "bg-destructive/10 text-destructive" :
                      "text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + j)}. {opt}
                    </p>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
