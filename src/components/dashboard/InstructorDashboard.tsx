import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { BookOpen, FileQuestion, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function InstructorDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
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
          supabase.from("enrollments").select("student_id").in("course_id", courseIds),
        ]);
        setQuizCount(qRes.data?.length || 0);
        const uniqueStudents = new Set(eRes.data?.map(e => e.student_id));
        setStudentCount(uniqueStudents.size);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Instructor Dashboard
          </h1>
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="My Courses" value={courses.length} icon={BookOpen} variant="primary" />
        <StatCard title="Total Quizzes" value={quizCount} icon={FileQuestion} variant="accent" />
        <StatCard title="Enrolled Students" value={studentCount} icon={Users} variant="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-muted-foreground text-sm">No courses yet. Create your first course!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((c) => (
                <div key={c.id} className="rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/courses/${c.id}`)}>
                  <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">{c.difficulty_level}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
