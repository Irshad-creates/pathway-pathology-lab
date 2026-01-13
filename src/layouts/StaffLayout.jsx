import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const StaffLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="space-y-3">
        <Link to="/staff" className="block hover:text-gray-300">
          Dashboard
        </Link>

        <Link to="/staff/reception" className="block hover:text-gray-300">
          Reception
        </Link>

        <Link to="/staff/appointments" className="block hover:text-gray-300">
          Appointments
        </Link>

        <Link to="/staff/billing" className="block hover:text-gray-300">
          Billing
        </Link>
      </nav>

      {/* Main area */}
      <div className="flex-1 bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow p-4">
          <h1 className="text-lg font-semibold">Staff Panel</h1>
        </header>

        {/* Page content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
