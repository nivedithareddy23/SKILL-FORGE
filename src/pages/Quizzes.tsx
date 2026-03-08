import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Clock, Play } from "lucide-react";

export default function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get enrolled course IDs
      const { data: enr } = await supabase.from("enrollments").select("course_id").eq("student_id", user.id);
      const courseIds = enr?.map(e => e.course_id) || [];
      if (courseIds.length > 0) {
        const { data: q } = await supabase.from("quizzes").select("*, courses(title)").in("course_id", courseIds).eq("is_published", true);
        setQuizzes(q || []);
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
              return (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-display text-base">{quiz.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{quiz.courses?.title}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {quiz.time_limit_minutes} min
                    </div>
                    <Badge variant="secondary" className="capitalize">{quiz.difficulty_level}</Badge>
                    {attempt?.completed_at ? (
                      <div className="space-y-2">
                        <Badge variant={attempt.score >= 70 ? "default" : "destructive"}>
                          Score: {attempt.score}%
                        </Badge>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/quiz/${quiz.id}/result/${attempt.id}`)}>
                          View Results
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
