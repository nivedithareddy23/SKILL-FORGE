import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, User, Layers, Code, Database, Globe, Server, Braces, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const courseIcons: Record<string, any> = {
  "Python Programming": Code,
  "Java Programming": Braces,
  "Data Structures & Algorithms": BarChart3,
  "MySQL Database": Database,
  "Frontend Development": Globe,
  "Backend Development": Server,
};

const instructorNames: Record<string, string> = {
  "Python Programming": "John Smith",
  "Java Programming": "David Lee",
  "Data Structures & Algorithms": "Sarah Kim",
  "MySQL Database": "Michael Brown",
  "Frontend Development": "Emily Davis",
  "Backend Development": "Robert Wilson",
};

const lessonCountMap: Record<string, number> = {
  "Python Programming": 40,
  "Java Programming": 35,
  "Data Structures & Algorithms": 50,
  "MySQL Database": 30,
  "Frontend Development": 55,
  "Backend Development": 48,
};

const defaultProgress: Record<string, number> = {
  "Python Programming": 60,
  "Java Programming": 25,
  "Data Structures & Algorithms": 15,
  "MySQL Database": 45,
  "Frontend Development": 70,
  "Backend Development": 35,
};

export default function Courses() {
  const { user, roles } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, any>>({});
  const [instructors, setInstructors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isInstructor = roles.includes("instructor") || roles.includes("admin");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("courses").select("*");
      setCourses(data || []);

      if (data && data.length > 0) {
        const instructorIds = [...new Set(data.map(c => c.instructor_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", instructorIds);
        const map: Record<string, string> = {};
        profiles?.forEach(p => { map[p.user_id] = p.full_name; });
        setInstructors(map);
      }

      if (user) {
        const { data: enr } = await supabase.from("enrollments").select("*").eq("student_id", user.id);
        const enrMap: Record<string, any> = {};
        enr?.forEach(e => { enrMap[e.course_id] = e; });
        setEnrollments(enrMap);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    const { error, data } = await supabase.from("enrollments").insert({ course_id: courseId, student_id: user.id }).select().single();
    if (error) {
      toast.error("Failed to enroll");
    } else {
      setEnrollments(prev => ({ ...prev, [courseId]: data }));
      toast.success("Enrolled successfully!");
    }
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  const gradientColors = [
    "from-primary/80 to-primary/40",
    "from-accent/80 to-accent/40",
    "from-warning/80 to-warning/40",
    "from-info/80 to-info/40",
    "from-success/80 to-success/40",
    "from-destructive/60 to-destructive/30",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground">Browse and enroll in courses to start learning.</p>
          </div>
          {isInstructor && (
            <Button onClick={() => navigate("/courses/create")}>
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-t-lg" />
                <CardContent className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => {
              const enrollment = enrollments[course.id];
              const progress = enrollment?.progress || defaultProgress[course.title] || 0;
              const CourseIcon = courseIcons[course.title] || BookOpen;
              const instructor = instructorNames[course.title] || instructors[course.instructor_id] || "Instructor";
              const lessons = lessonCountMap[course.title] || 20;

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group border-0 shadow-md">
                  {/* Header gradient with icon */}
                  <div className={`relative h-28 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center`}>
                    <CourseIcon className="h-12 w-12 text-card opacity-80" />
                    <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize backdrop-blur-sm bg-card/20 text-card`}>
                      {course.difficulty_level}
                    </span>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg leading-tight">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description || "No description"}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {instructor}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {lessons} Lessons
                      </span>
                    </div>

                    {/* Progress section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2.5" />
                    </div>

                    {/* Action button */}
                    {!isInstructor && enrollment ? (
                      <Button size="sm" className="w-full" variant={progress > 0 ? "default" : "outline"}>
                        {progress > 0 ? "Continue Learning" : "Start Learning"}
                      </Button>
                    ) : !isInstructor ? (
                      <Button size="sm" className="w-full" onClick={() => handleEnroll(course.id)}>
                        Enroll Now
                      </Button>
                    ) : user?.id === course.instructor_id ? (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/courses/${course.id}`)}>
                        Manage Course
                      </Button>
                    ) : null}
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
