import { useState, useEffect, useContext } from "react";
import TopHeader from "../components/TopHeader";
import Navbar from "../components/Navbar";
import AdminReports from "../components/AdminReports";
import AdminStaffManagement from "../components/AdminStaffManagement";
import AdminSettings from "../components/AdminSettings";
import AdminTestManagement from "../components/AdminTestManagement";
import { useNavigate } from "react-router-dom";
import { registrationAPI } from "../services/api";
import {
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Wifi,
  WifiOff,
  Users,
  TrendingUp,
  Clock,
  CreditCard,
  Phone,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useRealtime } from "../context/RealtimeContext";

export default function Administration() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isConnected: realtimeConnected } = useRealtime();
  const isAdmin = user?.role === "admin";
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [settings, setSettings] = useState({
    labName: "",
    upiId: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    reportGenerationTime: "tomorrow",
  });

  // Patient Overview States
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    recentRegistrations: [],
    topPatients: [],
    paymentBreakdown: { cash: 0, upi: 0, pending: 0 },
  });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientFilterType, setPatientFilterType] = useState("all");

  useEffect(() => {
    if (activeMenu === "patient-overview") {
      loadPatientOverview();
    } else if (activeMenu === "dashboard") {
      loadPatientOverview();
    }
  }, [activeMenu, patientFilterType]);

  const loadPatientOverview = async () => {
    setPatientLoading(true);
    try {
      const res = await registrationAPI.search({});
      let registrations = res.data || [];

      const now = new Date();
      let filterDate = null;

      if (patientFilterType === "weekly") {
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (patientFilterType === "monthly") {
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      if (filterDate) {
        registrations = registrations.filter(
          (reg) => new Date(reg.createdAt) >= filterDate,
        );
      }

      const uniquePatients = new Set(
        registrations.map((reg) => reg.patient?._id || reg.patient?.name),
      ).size;
      const totalRevenue = registrations.reduce(
        (sum, reg) => sum + (reg.totalAmount || 0),
        0,
      );
      const pendingAmount = registrations
        .filter(
          (reg) =>
            reg.status === "Pending" ||
            reg.paymentMethod === "Send to WhatsApp (Pending)",
        )
        .reduce(
          (sum, reg) => sum + (reg.balanceAmount || reg.totalAmount || 0),
          0,
        );

      const cashAmount = registrations
        .filter((reg) => reg.paymentMethod === "Cash")
        .reduce(
          (sum, reg) => sum + (reg.paidAmount || reg.totalAmount || 0),
          0,
        );

      const upiAmount = registrations
        .filter((reg) => reg.paymentMethod === "UPI")
        .reduce(
          (sum, reg) => sum + (reg.paidAmount || reg.totalAmount || 0),
          0,
        );

      const recentRegistrations = registrations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const patientTotals = {};
      registrations.forEach((reg) => {
        const patientKey = reg.patient?.name || "Unknown";
        if (!patientTotals[patientKey]) {
          patientTotals[patientKey] = {
            name: patientKey,
            totalAmount: 0,
            registrationCount: 0,
            mobile: reg.patient?.mobile || "-",
            lastVisit: reg.createdAt,
          };
        }
        patientTotals[patientKey].totalAmount += reg.totalAmount || 0;
        patientTotals[patientKey].registrationCount += 1;
        if (
          new Date(reg.createdAt) >
          new Date(patientTotals[patientKey].lastVisit)
        ) {
          patientTotals[patientKey].lastVisit = reg.createdAt;
        }
      });

      const topPatients = Object.values(patientTotals)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      setPatientStats({
        totalPatients: uniquePatients,
        totalRegistrations: registrations.length,
        totalRevenue,
        pendingPayments: pendingAmount,
        recentRegistrations,
        topPatients,
        paymentBreakdown: {
          cash: cashAmount,
          upi: upiAmount,
          pending: pendingAmount,
        },
      });
    } catch (error) {
      console.error("Error loading patient overview:", error);
    } finally {
      setPatientLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopHeader />
      <Navbar />

      <div className="flex h-[calc(100vh-120px)]">
        {/* Modern Sidebar */}
        <div className="w-72 bg-white shadow-lg border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Dashboard
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveMenu("dashboard")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    activeMenu === "dashboard"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <BarChart3 size={18} />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveMenu("patient-overview")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    activeMenu === "patient-overview"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Users size={18} />
                  Patient Overview
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveMenu("reports")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      activeMenu === "reports"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <FileText size={18} />
                    Reports
                  </button>
                )}
              </nav>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Management
              </h2>
              <nav className="space-y-2">
                {isAdmin && (
                  <button
                    onClick={() => setActiveMenu("staff-management")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      activeMenu === "staff-management"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Users size={18} />
                    Staff Management
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setActiveMenu("test-management")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      activeMenu === "test-management"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <FileText size={18} />
                    Test Management
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setActiveMenu("settings")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      activeMenu === "settings"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard size={18} />
                    Settings
                  </button>
                )}
              </nav>
            </div>

            <div className="border-t border-slate-200 pt-6 mt-6">
              <button
                onClick={() => navigate("/change-password")}
                className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-slate-700 hover:bg-slate-50"
              >
                <Clock size={18} />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Dashboard */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Dashboard
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Welcome back! Here's your lab overview.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
                  {realtimeConnected ? (
                    <>
                      <Wifi className="text-green-500" size={18} />
                      <span className="text-sm text-green-600">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="text-red-500" size={18} />
                      <span className="text-sm text-red-600">Offline</span>
                    </>
                  )}
                </div>
              </div>

              {patientLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Loading dashboard data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Total Patients
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            {patientStats.totalPatients}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Active patients
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Users className="text-blue-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Total Registrations
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            {patientStats.totalRegistrations}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            All time
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                          <FileText className="text-green-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Total Revenue
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            ₹{(patientStats.totalRevenue / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <ArrowUpRight size={14} /> Collected
                          </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <TrendingUp className="text-purple-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Pending Payments
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            ₹{(patientStats.pendingPayments / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                            <ArrowDownLeft size={14} /> Outstanding
                          </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <Clock className="text-orange-600" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      Payment Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">
                          Cash Payments
                        </p>
                        <p className="text-2xl font-bold text-yellow-900 mt-2">
                          ₹{patientStats.paymentBreakdown.cash.toLocaleString()}
                        </p>
                        <div className="mt-4 bg-yellow-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-yellow-600 h-full"
                            style={{
                              width: `${(patientStats.paymentBreakdown.cash / patientStats.totalRevenue) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">
                          UPI Payments
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-2">
                          ₹{patientStats.paymentBreakdown.upi.toLocaleString()}
                        </p>
                        <div className="mt-4 bg-blue-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{
                              width: `${(patientStats.paymentBreakdown.upi / patientStats.totalRevenue) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium">
                          Pending Payments
                        </p>
                        <p className="text-2xl font-bold text-red-900 mt-2">
                          ₹
                          {patientStats.paymentBreakdown.pending.toLocaleString()}
                        </p>
                        <div className="mt-4 bg-red-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-red-600 h-full"
                            style={{
                              width: `${(patientStats.paymentBreakdown.pending / (patientStats.totalRevenue + patientStats.pendingPayments)) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent & Top Patients */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Recent Registrations
                      </h3>
                      <div className="space-y-3">
                        {patientStats.recentRegistrations.length === 0 ? (
                          <p className="text-slate-500 text-center py-8">
                            No recent registrations
                          </p>
                        ) : (
                          patientStats.recentRegistrations.map((reg) => (
                            <div
                              key={reg._id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 text-sm">
                                  {reg.patient?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {reg.labCode}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  ₹{reg.totalAmount}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${reg.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                >
                                  {reg.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Top Patients
                      </h3>
                      <div className="space-y-3">
                        {patientStats.topPatients.length === 0 ? (
                          <p className="text-slate-500 text-center py-8">
                            No patient data
                          </p>
                        ) : (
                          patientStats.topPatients.map((patient, idx) => (
                            <div
                              key={patient.name}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-orange-500" : "bg-blue-500"}`}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {patient.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {patient.registrationCount} visits
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-green-600">
                                ₹{patient.totalAmount.toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Patient Overview */}
          {activeMenu === "patient-overview" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Patient Overview
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Detailed patient and registration analytics
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPatientFilterType("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      patientFilterType === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setPatientFilterType("weekly")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      patientFilterType === "weekly"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setPatientFilterType("monthly")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      patientFilterType === "monthly"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={loadPatientOverview}
                    disabled={patientLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    <RefreshCw
                      size={16}
                      className={patientLoading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {patientLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Loading patient data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Total Patients
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            {patientStats.totalPatients}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Active patients
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Users className="text-blue-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Total Registrations
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            {patientStats.totalRegistrations}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            All time
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                          <FileText className="text-green-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Total Revenue
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            ₹{(patientStats.totalRevenue / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <ArrowUpRight size={14} /> Collected
                          </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <TrendingUp className="text-purple-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium">
                            Pending Payments
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">
                            ₹{(patientStats.pendingPayments / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                            <ArrowDownLeft size={14} /> Outstanding
                          </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <Clock className="text-orange-600" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      Payment Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">
                          Cash Payments
                        </p>
                        <p className="text-2xl font-bold text-yellow-900 mt-2">
                          ₹{patientStats.paymentBreakdown.cash.toLocaleString()}
                        </p>
                        <div className="mt-4 bg-yellow-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-yellow-600 h-full"
                            style={{
                              width: `${(patientStats.paymentBreakdown.cash / patientStats.totalRevenue) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">
                          UPI Payments
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-2">
                          ₹{patientStats.paymentBreakdown.upi.toLocaleString()}
                        </p>
                        <div className="mt-4 bg-blue-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{
                              width: `${(patientStats.paymentBreakdown.upi / patientStats.totalRevenue) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium">
                          Pending Payments
                        </p>
                        <p className="text-2xl font-bold text-red-900 mt-2">
                          ₹
                          {patientStats.paymentBreakdown.pending.toLocaleString()}
                        </p>
                        <div className="mt-4 bg-red-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-red-600 h-full"
                            style={{
                              width: `${(patientStats.paymentBreakdown.pending / (patientStats.totalRevenue + patientStats.pendingPayments)) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent & Top Patients */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Recent Registrations
                      </h3>
                      <div className="space-y-3">
                        {patientStats.recentRegistrations.length === 0 ? (
                          <p className="text-slate-500 text-center py-8">
                            No recent registrations
                          </p>
                        ) : (
                          patientStats.recentRegistrations.map((reg) => (
                            <div
                              key={reg._id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 text-sm">
                                  {reg.patient?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {reg.labCode}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  ₹{reg.totalAmount}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${reg.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                >
                                  {reg.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Top Patients
                      </h3>
                      <div className="space-y-3">
                        {patientStats.topPatients.length === 0 ? (
                          <p className="text-slate-500 text-center py-8">
                            No patient data
                          </p>
                        ) : (
                          patientStats.topPatients.map((patient, idx) => (
                            <div
                              key={patient.name}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-orange-500" : "bg-blue-500"}`}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {patient.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {patient.registrationCount} visits
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-green-600">
                                ₹{patient.totalAmount.toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Reports */}
          {activeMenu === "reports" && <AdminReports />}

          {/* Staff Management */}
          {activeMenu === "staff-management" && <AdminStaffManagement />}

          {/* Test Management */}
          {activeMenu === "test-management" && <AdminTestManagement />}

          {/* Settings */}
          {activeMenu === "settings" && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
