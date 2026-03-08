import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, FileQuestion, BarChart3,
  Users, LogOut, GraduationCap, Sparkles, ChevronLeft, ChevronRight
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

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { roles, profile, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");
  const links = isAdmin ? adminLinks : isInstructor ? instructorLinks : studentLinks;
  const roleLabel = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student";

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border min-h-[72px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-lg font-bold text-sidebar-foreground whitespace-nowrap">SkillForge</h1>
            <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn("mb-2 flex items-center gap-3 px-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{profile?.full_name || "User"}</p>
            </div>
          )}
        </div>
        <button
          onClick={signOut}
          title={collapsed ? "Sign Out" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
