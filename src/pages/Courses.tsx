import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function Courses() {
  const { user, roles } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isInstructor = roles.includes("instructor") || roles.includes("admin");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("courses").select("*, profiles!courses_instructor_id_fkey(full_name)");
      setCourses(data || []);
      if (user) {
        const { data: enr } = await supabase.from("enrollments").select("course_id").eq("student_id", user.id);
        setEnrollments(enr?.map(e => e.course_id) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    const { error } = await supabase.from("enrollments").insert({ course_id: courseId, student_id: user.id });
    if (error) {
      toast.error("Failed to enroll");
    } else {
      setEnrollments(prev => [...prev, courseId]);
      toast.success("Enrolled successfully!");
    }
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground">Browse and enroll in courses.</p>
          </div>
          {isInstructor && (
            <Button onClick={() => navigate("/courses/create")}>
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading courses...</p>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 gradient-primary" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-display text-lg">{course.title}</CardTitle>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyColors[course.difficulty_level] || ""}`}>
                      {course.difficulty_level}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{course.description || "No description"}</p>
                  <p className="text-xs text-muted-foreground">By {course.profiles?.full_name || "Unknown"}</p>
                  {!isInstructor && (
                    enrollments.includes(course.id) ? (
                      <Badge variant="secondary">Enrolled</Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleEnroll(course.id)}>Enroll</Button>
                    )
                  )}
                  {isInstructor && user?.id === course.instructor_id && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/courses/${course.id}`)}>
                      Manage
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
