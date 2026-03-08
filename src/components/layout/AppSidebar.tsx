import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, FileQuestion, BarChart3,
  Users, Settings, LogOut, GraduationCap, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/quizzes", label: "My Quizzes", icon: FileQuestion },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const instructorLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "My Courses", icon: BookOpen },
  { to: "/quiz-generator", label: "Generate Quiz", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "All Courses", icon: BookOpen },
  { to: "/users", label: "Users", icon: Users },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AppSidebar() {
  const { roles, profile, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");
  const links = isAdmin ? adminLinks : isInstructor ? instructorLinks : studentLinks;
  const roleLabel = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-foreground">SkillForge</h1>
          <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate text-sidebar-foreground">{profile?.full_name || "User"}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
