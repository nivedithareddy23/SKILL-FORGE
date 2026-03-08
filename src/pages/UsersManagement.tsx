import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (!profiles) return;
    const userIds = profiles.map(p => p.user_id);
    const { data: roles } = await supabase.from("user_roles").select("*").in("user_id", userIds);
    const rolesMap: Record<string, AppRole[]> = {};
    roles?.forEach(r => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });
    setUsers(profiles.map(p => ({ ...p, roles: rolesMap[p.user_id] || [] })));
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    // Remove existing roles, add new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) {
      toast.error("Failed to update role");
    } else {
      toast.success("Role updated");
      loadUsers();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.user_id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Select value={u.roles[0] || "student"} onValueChange={(v) => handleRoleChange(u.user_id, v as AppRole)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
