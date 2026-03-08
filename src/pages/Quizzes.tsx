import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Clock, Play, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Show all published quizzes (not just enrolled)
      const { data: q } = await supabase
        .from("quizzes")
        .select("*, courses(title)")
        .eq("is_published", true);
      setQuizzes(q || []);

      // Get question counts
      if (q && q.length > 0) {
        const quizIds = q.map(quiz => quiz.id);
        const { data: questions } = await supabase.from("questions").select("quiz_id").in("quiz_id", quizIds);
        const countMap: Record<string, number> = {};
        questions?.forEach(qn => {
          countMap[qn.quiz_id] = (countMap[qn.quiz_id] || 0) + 1;
        });
        setQuestionCounts(countMap);
      }

      const { data: att } = await supabase.from("quiz_attempts").select("*").eq("student_id", user.id);
      const attMap: Record<string, any> = {};
      att?.forEach(a => { attMap[a.quiz_id] = a; });
      setAttempts(attMap);
      setLoading(false);
    };
    load();
  }, [user]);

  // Stats
  const completedCount = Object.values(attempts).filter(a => a.completed_at).length;
  const avgScore = (() => {
    const completed = Object.values(attempts).filter(a => a.score !== null);
    return completed.length > 0 ? Math.round(completed.reduce((s, a) => s + a.score, 0) / completed.length) : 0;
  })();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge with quizzes from all courses.</p>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <FileQuestion className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Quizzes</p>
                <p className="text-xl font-display font-bold text-foreground">{quizzes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-xl font-display font-bold text-foreground">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg Score</p>
                <p className="text-xl font-display font-bold text-foreground">{avgScore}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const attempt = attempts[quiz.id];
              const isCompleted = !!attempt?.completed_at;
              const totalQuestions = questionCounts[quiz.id] || 10;
              const scorePercent = attempt?.score || 0;
              const passed = scorePercent >= 70;
              const correctCount = Math.round((scorePercent / 100) * totalQuestions);

              return (
                <Card key={quiz.id} className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 border-0 shadow-sm">
                  <div className={`h-1.5 ${isCompleted ? (passed ? "bg-success" : "bg-destructive") : "bg-muted"}`} />
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground text-base">{quiz.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Course: {quiz.courses?.title || "Unknown"}</p>
                      </div>
                      {isCompleted && (
                        passed ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 ml-2" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 ml-2" />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FileQuestion className="h-3.5 w-3.5" />
                        {totalQuestions} Questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {quiz.time_limit_minutes} min
                      </span>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="capitalize text-xs">{quiz.difficulty_level}</Badge>
                      {isCompleted ? (
                        <Badge variant={passed ? "default" : "destructive"} className="text-xs">
                          Score: {correctCount}/{totalQuestions}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">Not Attempted</Badge>
                      )}
                    </div>

                    {/* Score progress bar */}
                    {isCompleted && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-semibold text-foreground">{scorePercent}%</span>
                        </div>
                        <Progress value={scorePercent} className="h-2" />
                      </div>
                    )}

                    {/* Actions */}
                    {isCompleted ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/quiz/${quiz.id}/result/${attempt.id}`)}>
                          View Results
                        </Button>
                        <Button size="sm" variant="ghost" className="shrink-0" title="Retake Quiz" onClick={() => navigate(`/quiz/${quiz.id}/attempt`)}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => navigate(`/quiz/${quiz.id}/attempt`)}>
                        <Play className="mr-2 h-3.5 w-3.5" /> Start Quiz
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
