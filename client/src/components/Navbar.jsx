import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Search,
  FileText,
  Workflow,
  Users,
  Settings,
  Phone,
} from "lucide-react";

export default function Navbar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const tabs = [
    { label: "Search", path: "/search", icon: Search },
    { label: "Test Registration", path: "/test-registration", icon: FileText },
    { label: "Lab Workflow", path: "/lab-workflow", icon: Workflow },
    ...(user?.role === "admin"
      ? [
          {
            label: "Technician Management",
            path: "/technician-management",
            icon: Users,
          },
        ]
      : []),
    { label: "Administration", path: "/administration", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 px-6 py-0 shadow-md">
      <div className="flex items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => handleNavigation(tab.path)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  active
                    ? "border-blue-500 text-blue-400 bg-slate-700/50"
                    : "border-transparent text-slate-300 hover:text-white hover:bg-slate-700/30"
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 text-slate-300 text-sm">
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span className="hidden md:inline">+91 90049 34515</span>
          </div>
          <span className="hidden lg:inline text-slate-400">/</span>
          <span className="hidden lg:inline">+91 77159 71308</span>
        </div>
      </div>
    </div>
  );
}
