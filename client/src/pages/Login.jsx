import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authAPI, settingsAPI } from "../services/api";
import {
  LogIn,
  User,
  Lock,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState("staff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [labName, setLabName] = useState(() => {
    // Initialize from localStorage to avoid flash
    try {
      const cached = localStorage.getItem("labSettings");
      if (cached) {
        const settings = JSON.parse(cached);
        return settings.labName || "Radiance Lab";
      }
    } catch {
      // Continue with default
    }
    return "Radiance Lab";
  });

  // Load lab settings on mount
  useEffect(() => {
    const loadLabSettings = async () => {
      try {
        const res = await settingsAPI.get();
        if (res.data?.labName) {
          setLabName(res.data.labName);
          // Cache in localStorage for persistence
          localStorage.setItem("labSettings", JSON.stringify(res.data));
        }
      } catch (err) {
        // Use cached or default if settings can't be loaded
      }
    };

    loadLabSettings();
  }, []);

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.login(username, password);
      login(res.data.token, res.data.sessionId, res.data.user);
      navigate("/test-registration");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.patientLogin(name, mobile);
      login(res.data.token, res.data.sessionId, res.data.user);
      navigate("/patient-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{labName}</h1>
          <p className="text-slate-600 mt-2">Clinical Diagnostic Centre</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Role Selection */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setRole("staff");
                setError("");
              }}
              className={`flex-1 py-4 px-4 font-semibold transition-all ${
                role === "staff"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Staff/Admin
            </button>
            <button
              onClick={() => {
                setRole("patient");
                setError("");
              }}
              className={`flex-1 py-4 px-4 font-semibold transition-all ${
                role === "patient"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Patient
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Staff Login */}
            {role === "staff" && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 mt-6"
                >
                  <LogIn size={18} />
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {/* Patient Login */}
            {role === "patient" && (
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Patient Name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter your mobile number"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 mt-6"
                >
                  <LogIn size={18} />
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {/* Demo Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-600 text-center">
                Secure login for authorized personnel only
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-6">
          © {new Date().getFullYear()} {labName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
