import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { RealtimeProvider } from "./context/RealtimeContext";
import Toast from "./components/Toast";
import Login from "./pages/Login";
import TestRegistration from "./pages/TestRegistration";
import Search from "./pages/Search";
import LabWorkflow from "./pages/LabWorkflow";
import Administration from "./pages/Administration";
import ChangePassword from "./pages/ChangePassword";
import PatientDashboard from "./pages/PatientDashboard";
import TechnicianManagement from "./pages/TechnicianManagement";

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Staff/Admin Routes */}
      <Route
        path="/test-registration"
        element={
          <ProtectedRoute requiredRole={["staff", "admin"]}>
            <TestRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute requiredRole={["staff", "admin"]}>
            <Search />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-workflow"
        element={
          <ProtectedRoute requiredRole={["staff", "admin"]}>
            <LabWorkflow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician-management"
        element={
          <ProtectedRoute requiredRole={["admin"]}>
            <TechnicianManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/administration"
        element={
          <ProtectedRoute requiredRole={["staff", "admin"]}>
            <Administration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute requiredRole={["staff", "admin"]}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute requiredRole={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <RealtimeProvider>
            <Toast />
            <AppRoutes />
          </RealtimeProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
