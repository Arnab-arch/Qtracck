import { useAuth } from "../../context/AuthContext";
import PatientDashboard from "./PatientDashboard";
import StaffDashboard   from "./StaffDashboard";

export default function DashboardHome() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "staff" || role === "admin") return <StaffDashboard />;
  return <PatientDashboard />;
}