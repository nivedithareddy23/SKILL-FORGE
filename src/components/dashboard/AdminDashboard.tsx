import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { Users, BookOpen, FileQuestion, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["hsl(250, 75%, 55%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 55%)"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, quizzes: 0, enrollments: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [profiles, courses, quizzes, enrollments, roles] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at"),
        supabase.from("courses").select("id"),
        supabase.from("quizzes").select("id"),
        supabase.from("enrollments").select("id"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      setStats({
        users: profiles.data?.length || 0,
        courses: courses.data?.length || 0,
        quizzes: quizzes.data?.length || 0,
        enrollments: enrollments.data?.length || 0,
      });

      // Role distribution for pie chart
      const roleMap: Record<string, number> = {};
      roles.data?.forEach(r => {
        roleMap[r.role] = (roleMap[r.role] || 0) + 1;
      });
      setRoleDistribution(Object.entries(roleMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Recent users with roles
      if (profiles.data) {
        const recent = profiles.data.slice(0, 8);
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

  const growthData = [
    { month: "Jan", users: 10 }, { month: "Feb", users: 18 },
    { month: "Mar", users: 25 }, { month: "Apr", users: 32 },
    { month: "May", users: 40 }, { month: "Jun", users: stats.users },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and user management.</p>
        </div>
        <Button onClick={() => navigate("/users")} variant="outline">
          <Users className="mr-2 h-4 w-4" /> Manage Users
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.users} icon={Users} variant="primary" trend={{ value: 22, label: "this month" }} />
        <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} variant="accent" trend={{ value: 8, label: "this month" }} />
        <StatCard title="Total Quizzes" value={stats.quizzes} icon={FileQuestion} variant="default" />
        <StatCard title="Enrollments" value={stats.enrollments} icon={TrendingUp} variant="warning" trend={{ value: 15, label: "this month" }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(250, 75%, 55%)" strokeWidth={2.5} dot={{ fill: "hsl(250, 75%, 55%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {roleDistribution.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {roleDistribution.map((_, i) => (
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Recent Users</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>View All</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentUsers.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{u.full_name || "Unknown"}</p>
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
