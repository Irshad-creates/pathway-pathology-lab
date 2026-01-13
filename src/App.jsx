import { BrowserRouter, Routes, Route } from "react-router-dom";
import StaffLogin from "./pages/auth/StaffLogin";
import StaffLayout from "./layouts/StaffLayout";
import Dashboard from "./pages/staff/Dashboard";
import Reception from "./pages/staff/Reception";
import Appointments from "./pages/staff/Appointments";
import Billing from "./pages/staff/Billing";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/login" element={<StaffLogin />} />

        {/* Full-width Test Registration (NO sidebar) */}
        <Route path="/staff/reception" element={<Reception />} />

        {/* Staff layout pages */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
