import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function Dashboard() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");

  return (
    <DashboardLayout>
      {isAdmin ? <AdminDashboard /> : isInstructor ? <InstructorDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
}
