import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { BookOpen, FileQuestion, Users, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["hsl(250, 75%, 55%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 55%)"];

export default function InstructorDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const courseRes = await supabase.from("courses").select("*").eq("instructor_id", user.id);
      const c = courseRes.data || [];
      setCourses(c);
      if (c.length > 0) {
        const courseIds = c.map(x => x.id);
        const [qRes, eRes] = await Promise.all([
          supabase.from("quizzes").select("id").in("course_id", courseIds),
          supabase.from("enrollments").select("student_id, course_id").in("course_id", courseIds),
        ]);
        setQuizCount(qRes.data?.length || 0);
        const uniqueStudents = new Set(eRes.data?.map(e => e.student_id));
        setStudentCount(uniqueStudents.size);

        // Enrollment distribution
        const distMap: Record<string, number> = {};
        eRes.data?.forEach(e => {
          const course = c.find(co => co.id === e.course_id);
          const name = course?.title || "Unknown";
          distMap[name] = (distMap[name] || 0) + 1;
        });
        setEnrollmentData(Object.entries(distMap).map(([name, value]) => ({ name, value })));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const avgEngagement = studentCount > 0 ? Math.min(Math.round((studentCount / Math.max(courses.length, 1)) * 25), 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/courses/create")} variant="default">
            <BookOpen className="mr-2 h-4 w-4" /> New Course
          </Button>
          <Button onClick={() => navigate("/quiz-generator")} variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> Generate Quiz
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Courses" value={courses.length} icon={BookOpen} variant="primary" trend={{ value: 10, label: "this month" }} />
        <StatCard title="Total Quizzes" value={quizCount} icon={FileQuestion} variant="accent" />
        <StatCard title="Enrolled Students" value={studentCount} icon={Users} variant="default" trend={{ value: 18, label: "this month" }} />
        <StatCard title="Engagement" value={`${avgEngagement}%`} icon={TrendingUp} variant="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Enrollment Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {enrollmentData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8">No enrollments yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={enrollmentData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, value }) => `${name.substring(0, 12)}… (${value})`}>
                    {enrollmentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">My Courses</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/courses")}>View All</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">No courses yet.</p>
                <Button size="sm" onClick={() => navigate("/courses/create")}>Create Course</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 4).map((c) => (
                  <div key={c.id} className="rounded-xl border border-border p-4 hover:shadow-sm hover:bg-muted/30 transition-all cursor-pointer" onClick={() => navigate(`/courses/${c.id}`)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-sm">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.description}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize shrink-0 ml-2">{c.difficulty_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
