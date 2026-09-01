import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Landing from "./pages/public/Landing.jsx";
import FeaturesPage from "./pages/public/FeaturesPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminAddLocationPage from "./pages/admin/AdminAddLocationPage.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
// import ProfilePage from "./pages/shared/ProfilePage.jsx";
import LocationServicesPage from "./pages/patient/LocationServicesPage.jsx"
import {
  PatientLocations, PatientServices,
  MyTokens, 
} from "./pages/patient";
import PatientProfile from "./pages/patient/PatientProfile.jsx"
import {
  ManageLocations, ManageServices, ManageQueues,
  Analytics, StaffProfile,
} from "./pages/staff/index.jsx";
import BrowseLocationsPage from "./pages/patient/BrowseLocationsPage.jsx";
import BrowseQueuesPage from "./pages/patient/BrowseQueuesPage.jsx";
import QueuePage from "./pages/patient/QueuePage.jsx";


function Shell({ children, roles }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/feature"  element={<FeaturesPage />} />

      {/* PATIENT */}
      <Route path="/dashboard"            element={<Shell><DashboardHome /></Shell>} />
      <Route path="/dashboard/locations"  element={<Shell><PatientLocations /></Shell>} />
      <Route path="/dashboard/services"   element={<Shell><PatientServices /></Shell>} />
      <Route path="/dashboard/join"       element={<Shell><BrowseQueuesPage /></Shell>} />
      <Route path="/dashboard/my-queue"   element={<Shell><QueuePage /></Shell>} />
      <Route path="/dashboard/queues/:service_id" element={<Shell><QueuePage /></Shell>} />
      <Route path="/dashboard/my-tokens"  element={<Shell><MyTokens /></Shell>} />
      <Route path="/dashboard/profile"    element={<Shell><PatientProfile /></Shell>} />
      <Route path="/locations/:location_id/services" element={<Shell><PatientServices /></Shell>} />

      {/* STAFF / ADMIN ONLY */}
      <Route path="/dashboard/manage-locations" element={<Shell roles={["staff","admin"]}><ManageLocations /></Shell>} />
      <Route path="/dashboard/manage-services"  element={<Shell roles={["staff","admin"]}><ManageServices /></Shell>} />
      <Route path="/dashboard/manage-queues"    element={<Shell roles={["staff","admin"]}><ManageQueues /></Shell>} />
      <Route path="/dashboard/analytics"        element={<Shell roles={["staff","admin"]}><Analytics /></Shell>} />
      <Route path="/dashboard/staff-profile"    element={<Shell roles={["staff","admin"]}><StaffProfile /></Shell>} />
      <Route
        path="/dashboard/add-location"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminAddLocationPage />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}