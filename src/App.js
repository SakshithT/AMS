import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ResidentDashboard from "./pages/Resident/ResidentDashboard";
import SecurityDashboard from "./pages/Security/SecurityDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
// djddwj
function App() {
  return (
    <Router>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Route */}
        <Route
          path="/Admin/AdminDashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Resident Route */}
        <Route
          path="/Resident/ResidentDashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_RESIDENT"]}>
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Security Route */}
        <Route
          path="/Security/SecurityDashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SECURITY"]}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;