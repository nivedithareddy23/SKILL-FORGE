import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import { Target, TrendingUp, Clock, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, Legend
} from "recharts";

const COLORS = ["hsl(250, 75%, 55%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 55%)", "hsl(210, 80%, 55%)"];

export default function Analytics() {
  const { user, roles } = useAuth();
  const [quizScores, setQuizScores] = useState<any[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<any[]>([]);
  const [progressOverTime, setProgressOverTime] = useState<any[]>([]);
  const [masteryData, setMasteryData] = useState<any[]>([]);

  const isInstructor = roles.includes("instructor") || roles.includes("admin");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      if (isInstructor) {
        const { data: courses } = await supabase.from("courses").select("id, title").eq("instructor_id", user.id);
        if (courses && courses.length > 0) {
          const courseIds = courses.map(c => c.id);
          const { data: quizIds } = await supabase.from("quizzes").select("id").in("course_id", courseIds);
          const { data: attempts } = await supabase.from("quiz_attempts")
            .select("score, started_at, quizzes(title, course_id)")
            .in("quiz_id", quizIds?.map(q => q.id) || [])
            .not("score", "is", null);

          if (attempts) {
            const quizMap: Record<string, { total: number; count: number; name: string }> = {};
            attempts.forEach(a => {
              const name = (a.quizzes as any)?.title || "Unknown";
              if (!quizMap[name]) quizMap[name] = { total: 0, count: 0, name };
              quizMap[name].total += a.score || 0;
              quizMap[name].count++;
            });
            setQuizScores(Object.values(quizMap).map(q => ({ name: q.name, avgScore: Math.round(q.total / q.count) })));
          }

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

          setProgressOverTime(attempts.map((a, i) => ({
            attempt: i + 1,
            score: a.score,
            date: new Date(a.started_at).toLocaleDateString(),
          })));

          // Mastery data for radial chart
          const topicMap: Record<string, { total: number; count: number }> = {};
          attempts.forEach(a => {
            const name = (a.quizzes as any)?.title || "Quiz";
            if (!topicMap[name]) topicMap[name] = { total: 0, count: 0 };
            topicMap[name].total += a.score || 0;
            topicMap[name].count++;
          });
          setMasteryData(Object.entries(topicMap).slice(0, 4).map(([name, d], i) => ({
            name: name.substring(0, 15),
            mastery: Math.round(d.total / d.count),
            fill: COLORS[i % COLORS.length],
          })));
        }

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

  // Sample weekly data
  const weeklyActivity = [
    { day: "Mon", hours: 2.5 }, { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 1.8 }, { day: "Thu", hours: 4.1 },
    { day: "Fri", hours: 3.5 }, { day: "Sat", hours: 5.0 },
    { day: "Sun", hours: 2.0 },
  ];

  const completedCourses = 2;
  const inProgressCourses = 4;
  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((s, q) => s + (q.score || q.avgScore || 0), 0) / quizScores.length)
    : 80;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">{isInstructor ? "Track student performance across your courses." : "Track your learning progress and performance."}</p>
        </div>

        {/* KPI Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Courses Completed" value={completedCourses} icon={Target} variant="accent" trend={{ value: 50, label: "vs last month" }} />
          <StatCard title="In Progress" value={inProgressCourses} icon={TrendingUp} variant="primary" />
          <StatCard title="Avg Quiz Score" value={`${avgScore}%`} icon={Award} variant="default" trend={{ value: 5, label: "improvement" }} />
          <StatCard title="Study Hours" value="45h" icon={Clock} variant="warning" trend={{ value: 12, label: "this week" }} />
        </div>

        {/* Row 1: Quiz Performance + Course Distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">{isInstructor ? "Average Quiz Scores" : "Quiz Performance"}</CardTitle>
            </CardHeader>
            <CardContent>
              {quizScores.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={quizScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
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
              <CardTitle className="font-display text-lg">{isInstructor ? "Enrollment Distribution" : "Course Difficulty Breakdown"}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {courseDistribution.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={courseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
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
        </div>

        {/* Row 2: Weekly Activity + Score Progression / Mastery */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg">Weekly Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(170, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(170, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="hours" stroke="hsl(170, 60%, 45%)" fill="url(#activityGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {!isInstructor && masteryData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Skill Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {masteryData.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.mastery}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.mastery}%`, backgroundColor: item.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(220, 15%, 88%)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(250, 75%, 55%)" strokeWidth="10" strokeDasharray={`${74 * 3.14} ${100 * 3.14}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-foreground">74%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">Student Engagement</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Row 3: Score Progression (students only) */}
        {!isInstructor && progressOverTime.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Score Progression Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(250, 75%, 55%)" strokeWidth={2.5} dot={{ fill: "hsl(250, 75%, 55%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
