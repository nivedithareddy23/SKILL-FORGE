import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { BookOpen, FileQuestion, TrendingUp, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from "recharts";

const COLORS = ["hsl(250, 75%, 55%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 55%)", "hsl(210, 80%, 55%)"];

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const completedAttempts = attempts.filter(a => a.score !== null);
  const avgScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length)
    : 0;

  const completedCourses = enrollments.filter(e => (e.progress || 0) >= 100).length;
  const engagement = enrollments.length > 0 ? Math.round((completedAttempts.length / Math.max(enrollments.length, 1)) * 100) : 0;
  const recommendedLevel = avgScore > 80 ? "Advanced" : avgScore >= 50 ? "Intermediate" : "Beginner";

  // Chart data
  const scoreData = completedAttempts.slice(0, 7).map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.score || 0,
  }));

  const levelDistribution = (() => {
    const map: Record<string, number> = {};
    enrollments.forEach(e => {
      const level = (e.courses as any)?.difficulty_level || "beginner";
      map[level] = (map[level] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  })();

  const weeklyProgress = [10, 20, 35, 50, 65, 70, 80].map((v, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    progress: v,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {profile?.full_name || "Student"} 👋
        </h1>
        <p className="text-muted-foreground">Here's your learning progress overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Courses" value={enrollments.length} icon={BookOpen} variant="primary" trend={{ value: 12, label: "this month" }} />
        <StatCard title="Completed" value={completedCourses} icon={Target} variant="accent" trend={{ value: 8, label: "this month" }} />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} variant="default" trend={{ value: avgScore > 70 ? 5 : -3, label: "vs last" }} />
        <StatCard title="Engagement" value={`${Math.min(engagement, 100)}%`} icon={FileQuestion} variant="warning" />
        <StatCard title="Study Hours" value="45h" icon={Clock} variant="default" trend={{ value: 15, label: "this week" }} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Weekly Learning Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250, 75%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(250, 75%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="progress" stroke="hsl(250, 75%, 55%)" fill="url(#progressGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Course Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {levelDistribution.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={levelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {levelDistribution.map((_, i) => (
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

      {/* Quiz Scores + Enrolled Courses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Quiz Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {scoreData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No quiz data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(170, 60%, 45%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Enrolled Courses</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/courses")}>View All</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">No courses yet.</p>
                <Button size="sm" onClick={() => navigate("/courses")}>Browse Courses</Button>
              </div>
            ) : (
              enrollments.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{e.courses?.title}</p>
                    <Badge variant="secondary" className="mt-1 text-xs capitalize">{e.courses?.difficulty_level}</Badge>
                  </div>
                  <div className="w-28 ml-4">
                    <Progress value={e.progress || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{e.progress || 0}%</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
