import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { BookOpen, FileQuestion, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [enr, att] = await Promise.all([
        supabase.from("enrollments").select("*, courses(title, difficulty_level)").eq("student_id", user.id),
        supabase.from("quiz_attempts").select("*, quizzes(title, course_id)").eq("student_id", user.id).order("started_at", { ascending: false }),
      ]);
      setEnrollments(enr.data || []);
      setAttempts(att.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const avgScore = attempts.length > 0
    ? Math.round(attempts.filter(a => a.score !== null).reduce((s, a) => s + (a.score || 0), 0) / Math.max(attempts.filter(a => a.score !== null).length, 1))
    : 0;

  const recommendedLevel = avgScore > 80 ? "advanced" : avgScore >= 50 ? "intermediate" : "beginner";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {profile?.full_name || "Student"} 👋
        </h1>
        <p className="text-muted-foreground">Here's your learning progress overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Enrolled Courses" value={enrollments.length} icon={BookOpen} variant="primary" />
        <StatCard title="Quizzes Taken" value={attempts.length} icon={FileQuestion} variant="accent" />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} variant="default" />
        <StatCard title="Recommended Level" value={recommendedLevel.charAt(0).toUpperCase() + recommendedLevel.slice(1)} icon={Target} variant="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : enrollments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No courses yet. Browse courses to get started!</p>
            ) : (
              enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{e.courses?.title}</p>
                    <Badge variant="secondary" className="mt-1 text-xs capitalize">{e.courses?.difficulty_level}</Badge>
                  </div>
                  <div className="w-24">
                    <Progress value={e.progress || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{e.progress || 0}%</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Quiz Attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : attempts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No quiz attempts yet.</p>
            ) : (
              attempts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{a.quizzes?.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.started_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={a.score !== null && a.score >= 70 ? "default" : "secondary"}>
                    {a.score !== null ? `${a.score}%` : "In Progress"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
