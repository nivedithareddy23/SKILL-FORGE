import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(250, 75%, 55%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 55%)", "hsl(210, 80%, 55%)"];

export default function Analytics() {
  const { user, roles } = useAuth();
  const [quizScores, setQuizScores] = useState<any[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<any[]>([]);
  const [progressOverTime, setProgressOverTime] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const isInstructor = roles.includes("instructor") || roles.includes("admin");

    const load = async () => {
      if (isInstructor) {
        // Get all attempts for instructor's courses
        const { data: courses } = await supabase.from("courses").select("id, title").eq("instructor_id", user.id);
        if (courses && courses.length > 0) {
          const courseIds = courses.map(c => c.id);
          const { data: attempts } = await supabase.from("quiz_attempts")
            .select("score, started_at, quizzes(title, course_id)")
            .in("quiz_id", (await supabase.from("quizzes").select("id").in("course_id", courseIds)).data?.map(q => q.id) || [])
            .not("score", "is", null);

          if (attempts) {
            // Bar chart: avg score per quiz
            const quizMap: Record<string, { total: number; count: number; name: string }> = {};
            attempts.forEach(a => {
              const name = (a.quizzes as any)?.title || "Unknown";
              if (!quizMap[name]) quizMap[name] = { total: 0, count: 0, name };
              quizMap[name].total += a.score || 0;
              quizMap[name].count++;
            });
            setQuizScores(Object.values(quizMap).map(q => ({ name: q.name, avgScore: Math.round(q.total / q.count) })));
          }

          // Pie chart: enrollments per course
          const { data: enr } = await supabase.from("enrollments").select("course_id").in("course_id", courseIds);
          const distMap: Record<string, number> = {};
          enr?.forEach(e => {
            const course = courses.find(c => c.id === e.course_id);
            const name = course?.title || "Unknown";
            distMap[name] = (distMap[name] || 0) + 1;
          });
          setCourseDistribution(Object.entries(distMap).map(([name, value]) => ({ name, value })));
        }
      } else {
        // Student analytics
        const { data: attempts } = await supabase.from("quiz_attempts")
          .select("score, started_at, quizzes(title)")
          .eq("student_id", user.id)
          .not("score", "is", null)
          .order("started_at");

        if (attempts) {
          setQuizScores(attempts.map(a => ({
            name: (a.quizzes as any)?.title || "Quiz",
            score: a.score,
          })));

          // Line chart: scores over time
          setProgressOverTime(attempts.map((a, i) => ({
            attempt: i + 1,
            score: a.score,
            date: new Date(a.started_at).toLocaleDateString(),
          })));
        }

        // Pie: courses enrolled
        const { data: enr } = await supabase.from("enrollments").select("courses(title, difficulty_level)").eq("student_id", user.id);
        const levelMap: Record<string, number> = {};
        enr?.forEach(e => {
          const level = (e.courses as any)?.difficulty_level || "unknown";
          levelMap[level] = (levelMap[level] || 0) + 1;
        });
        setCourseDistribution(Object.entries(levelMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));
      }
    };
    load();
  }, [user, roles]);

  const isInstructor = roles.includes("instructor") || roles.includes("admin");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">{isInstructor ? "Track student performance across your courses." : "Track your learning progress."}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">{isInstructor ? "Average Quiz Scores" : "Quiz Scores"}</CardTitle>
            </CardHeader>
            <CardContent>
              {quizScores.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quizScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey={isInstructor ? "avgScore" : "score"} fill="hsl(250, 75%, 55%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">{isInstructor ? "Enrollment Distribution" : "Course Difficulty Distribution"}</CardTitle>
            </CardHeader>
            <CardContent>
              {courseDistribution.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={courseDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {courseDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {!isInstructor && progressOverTime.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-display text-lg">Score Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(170, 60%, 45%)" strokeWidth={2} dot={{ fill: "hsl(170, 60%, 45%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
