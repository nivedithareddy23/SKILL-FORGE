import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Clock, Play, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
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
      const { data: enr } = await supabase.from("enrollments").select("course_id").eq("student_id", user.id);
      const courseIds = enr?.map(e => e.course_id) || [];
      if (courseIds.length > 0) {
        const { data: q } = await supabase.from("quizzes").select("*, courses(title)").in("course_id", courseIds).eq("is_published", true);
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
      }
      const { data: att } = await supabase.from("quiz_attempts").select("*").eq("student_id", user.id);
      const attMap: Record<string, any> = {};
      att?.forEach(a => { attMap[a.quiz_id] = a; });
      setAttempts(attMap);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Quizzes</h1>
          <p className="text-muted-foreground">Quizzes from your enrolled courses.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes available. Enroll in courses first!</p>
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

              return (
                <Card key={quiz.id} className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className={`h-1.5 ${isCompleted ? (passed ? "bg-success" : "bg-destructive") : "bg-muted"}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-base">{quiz.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{quiz.courses?.title}</p>
                      </div>
                      {isCompleted ? (
                        passed ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-3.5 w-3.5" />
                        {totalQuestions} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {quiz.time_limit_minutes} min
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{quiz.difficulty_level}</Badge>
                      {isCompleted && (
                        <Badge variant={passed ? "default" : "destructive"}>
                          Score: {scorePercent}%
                        </Badge>
                      )}
                      {!isCompleted && !attempt && (
                        <Badge variant="outline" className="text-muted-foreground">Not Attempted</Badge>
                      )}
                    </div>

                    {isCompleted && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-medium">{scorePercent}%</span>
                        </div>
                        <Progress value={scorePercent} className="h-2" />
                      </div>
                    )}

                    {isCompleted ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/quiz/${quiz.id}/result/${attempt.id}`)}>
                          View Results
                        </Button>
                        <Button size="sm" variant="ghost" className="shrink-0" onClick={() => navigate(`/quiz/${quiz.id}/attempt`)}>
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
