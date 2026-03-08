import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { Users, BookOpen, FileQuestion, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, quizzes: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profiles, courses, quizzes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at"),
        supabase.from("courses").select("id"),
        supabase.from("quizzes").select("id"),
      ]);
      setStats({
        users: profiles.data?.length || 0,
        courses: courses.data?.length || 0,
        quizzes: quizzes.data?.length || 0,
      });

      // Get recent users with roles
      if (profiles.data) {
        const recent = profiles.data.slice(0, 10);
        const userIds = recent.map(p => p.user_id);
        const rolesRes = await supabase.from("user_roles").select("user_id, role").in("user_id", userIds);
        const rolesMap: Record<string, string[]> = {};
        rolesRes.data?.forEach(r => {
          if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
          rolesMap[r.user_id].push(r.role);
        });
        setRecentUsers(recent.map(p => ({ ...p, roles: rolesMap[p.user_id] || [] })));
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and user management.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={stats.users} icon={Users} variant="primary" />
        <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} variant="accent" />
        <StatCard title="Total Quizzes" value={stats.quizzes} icon={FileQuestion} variant="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {u.roles.map((r: string) => (
                      <Badge key={r} variant={r === "admin" ? "destructive" : r === "instructor" ? "default" : "secondary"} className="capitalize text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
