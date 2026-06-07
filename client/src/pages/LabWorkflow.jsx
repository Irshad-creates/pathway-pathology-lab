import { useState, useEffect, useContext } from "react";
import TopHeader from "../components/TopHeader";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import {
  hasPermission,
  canAccessLabWorkflow,
} from "../services/rolePermissions";
import {
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Timer,
  RefreshCw,
  Search,
  Filter,
  Bell,
  Microscope,
  TestTube,
  Send,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  X,
  Smartphone,
  Zap,
  Users,
  MapPin,
} from "lucide-react";
import { registrationAPI } from "../services/api";
import { generateLabReport } from "../services/reportGenerator";

export default function LabWorkflow() {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  if (!canAccessLabWorkflow(user?.role)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopHeader />
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Access Denied
            </h2>
            <p className="text-red-700">
              You don't have permission to access Lab Workflow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [workflowData, setWorkflowData] = useState({
    registration: [],
    urgent: [],
    samplePending: [],
    sampleCollected: [],
    processing: [],
    reportReady: [],
    printed: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTechnician, setFilterTechnician] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [workflowStats, setWorkflowStats] = useState({});
  const [labSettings, setLabSettings] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showResultEntry, setShowResultEntry] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [activeTab, setActiveTab] = useState("samplePending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadWorkflowData();
    loadWorkflowStats();
    loadTechnicians();
    const interval = setInterval(() => {
      loadWorkflowData();
      loadWorkflowStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadWorkflowData();
    setCurrentPage(1);
  }, [searchQuery, filterTechnician, filterFromDate, filterToDate]);

  const loadWorkflowStats = async () => {
    try {
      const response = await registrationAPI.search({});
      const allRegistrations = response.data || [];
      const today = new Date().toDateString();
      const todayRegistrations = allRegistrations.filter(
        (r) => new Date(r.createdAt).toDateString() === today,
      );

      setWorkflowStats({
        totalToday: todayRegistrations.length,
        pending: allRegistrations.filter((r) => r.status === "Sample Pending")
          .length,
        processing: allRegistrations.filter((r) => r.status === "Processing")
          .length,
        completed: allRegistrations.filter((r) => r.status === "Completed")
          .length,
        urgentSamples: allRegistrations.filter((r) => r.isUrgent === true)
          .length,
      });
    } catch (error) {}
  };

  const loadTechnicians = async () => {
    try {
      const response = await fetch("/api/staff/technicians/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setTechnicians(data);
    } catch (error) {
      setTechnicians([]);
    }
  };

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      const statuses = [
        "Registration",
        "Sample Pending",
        "Sample Collected",
        "Processing",
        "Report Ready",
        "Printed",
      ];
      const promises = statuses.map((status) =>
        fetch(`/api/status/by-status/${encodeURIComponent(status)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((res) => res.json()),
      );

      const results = await Promise.all(promises);
      const grouped = {
        registration: results[0] || [],
        urgent: [],
        samplePending: results[1] || [],
        sampleCollected: results[2] || [],
        processing: results[3] || [],
        reportReady: results[4] || [],
        printed: results[5] || [],
      };

      // Separate urgent items from all statuses
      const allItems = Object.values(results).flat();
      grouped.urgent = allItems.filter((reg) => reg.isUrgent === true);

      Object.keys(grouped).forEach((key) => {
        grouped[key] = grouped[key]
          .filter((reg) => {
            if (user?.role === "technician" && reg.technician !== user?.name)
              return false;
            const matchesSearch =
              !searchQuery ||
              reg.labCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              reg.patient?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              reg.patient?.mobile?.includes(searchQuery);
            const matchesTechnician =
              !filterTechnician || reg.technician === filterTechnician;
            const matchesDate =
              (!filterFromDate && !filterToDate) ||
              (new Date(reg.createdAt).toISOString().split("T")[0] >=
                (filterFromDate || "1900-01-01") &&
                new Date(reg.createdAt).toISOString().split("T")[0] <=
                  (filterToDate || "2099-12-31"));
            return matchesSearch && matchesTechnician && matchesDate;
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt),
          );
      });

      setWorkflowData(grouped);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    registrationId,
    newStatus,
    technician = null,
    results = null,
  ) => {
    try {
      const response = await fetch(
        `/api/status/update-status/${registrationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: newStatus,
            technician,
            results,
            timestamp: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update status");
      loadWorkflowData();
      loadWorkflowStats();
      toast.success(`Status updated to ${newStatus}!`);
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleResultEntry = (registration) => {
    setSelectedRegistration(registration);
    setTestResults(registration.results || {});
    setShowResultEntry(true);
  };

  const saveTestResults = async () => {
    try {
      await updateStatus(
        selectedRegistration._id,
        "Report Ready",
        selectedRegistration.technician,
        testResults,
      );
      setShowResultEntry(false);
      setSelectedRegistration(null);
      setTestResults({});
    } catch (error) {
      toast.error("Error saving test results");
    }
  };

  const generateReport = async (registration) => {
    try {
      setLoading(true);
      const result = await generateLabReport(
        registration,
        registration.results || testResults || {},
        labSettings,
      );
      if (result.success) {
        toast.success(result.message);
        await updateStatus(registration._id, "Printed");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopHeader />
      <Navbar />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Microscope className="text-white" size={32} />
              </div>
              Lab Workflow
            </h1>
            <p className="text-slate-600">Manage sample processing workflow</p>
          </div>
          <div className="flex gap-3">
            {notifications.length > 0 && (
              <div className="flex items-center bg-red-100 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                <Bell size={16} className="mr-2" />
                {notifications.length} Urgent
              </div>
            )}
            <button
              onClick={loadWorkflowData}
              disabled={loading}
              className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition font-medium"
            >
              <RefreshCw
                size={18}
                className={`mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {hasPermission(user?.role, "canViewStats") && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              {
                label: "Today",
                value: workflowStats.totalToday || 0,
                color: "blue",
              },
              {
                label: "Pending",
                value: workflowStats.pending || 0,
                color: "red",
              },
              {
                label: "Processing",
                value: workflowStats.processing || 0,
                color: "orange",
              },
              {
                label: "Completed",
                value: workflowStats.completed || 0,
                color: "green",
              },
              {
                label: "Urgent",
                value: workflowStats.urgentSamples || 0,
                color: "red",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <p className="text-slate-600 text-xs font-semibold uppercase">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${stat.color === "blue" ? "text-blue-600" : stat.color === "red" ? "text-red-600" : stat.color === "orange" ? "text-orange-600" : "text-green-600"}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-2">
              <label className="block text-xs text-slate-600 font-medium mb-1">
                Search
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {hasPermission(user?.role, "canViewAllRegistrations") && (
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Technician
                </label>
                <select
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filterTechnician}
                  onChange={(e) => setFilterTechnician(e.target.value)}
                >
                  <option value="">All Technicians</option>
                  {technicians.map((tech) => (
                    <option key={tech._id} value={tech.name}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">
                From Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">
                To Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterTechnician("");
                setFilterFromDate("");
                setFilterToDate("");
                loadWorkflowData();
              }}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium border border-red-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {[
              {
                id: "registration",
                label: "Registration",
                icon: FileText,
                color: "slate",
              },
              {
                id: "urgent",
                label: "Urgent",
                icon: AlertCircle,
                color: "red",
              },
              {
                id: "samplePending",
                label: "Sample Pending",
                icon: Clock,
                color: "red",
              },
              {
                id: "sampleCollected",
                label: "Sample Collected",
                icon: TestTube,
                color: "orange",
              },
              {
                id: "processing",
                label: "Processing",
                icon: Microscope,
                color: "blue",
              },
              {
                id: "reportReady",
                label: "Report Ready",
                icon: FileText,
                color: "green",
              },
              {
                id: "printed",
                label: "Printed",
                icon: CheckCircle,
                color: "purple",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const count = workflowData[tab.id]?.length || 0;
              const isActive = activeTab === tab.id;

              const colorClasses = {
                slate: isActive
                  ? "border-slate-500 text-slate-600 bg-slate-50"
                  : "border-transparent text-slate-600 hover:text-slate-900",
                red: isActive
                  ? "border-red-500 text-red-600 bg-red-50"
                  : "border-transparent text-slate-600 hover:text-slate-900",
                orange: isActive
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-slate-600 hover:text-slate-900",
                blue: isActive
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-slate-600 hover:text-slate-900",
                green: isActive
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-slate-600 hover:text-slate-900",
                purple: isActive
                  ? "border-purple-500 text-purple-600 bg-purple-50"
                  : "border-transparent text-slate-600 hover:text-slate-900",
              };

              const badgeClasses = {
                slate: isActive
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-200 text-slate-700",
                red: isActive
                  ? "bg-red-200 text-red-700"
                  : "bg-slate-200 text-slate-700",
                orange: isActive
                  ? "bg-orange-200 text-orange-700"
                  : "bg-slate-200 text-slate-700",
                blue: isActive
                  ? "bg-blue-200 text-blue-700"
                  : "bg-slate-200 text-slate-700",
                green: isActive
                  ? "bg-green-200 text-green-700"
                  : "bg-slate-200 text-slate-700",
                purple: isActive
                  ? "bg-purple-200 text-purple-700"
                  : "bg-slate-200 text-slate-700",
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${colorClasses[tab.color]}`}
                >
                  <Icon size={18} />
                  {tab.label}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${badgeClasses[tab.color]}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-600 text-lg font-semibold">
              Loading workflow...
            </p>
          </div>
        ) : (
          <div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {workflowData[activeTab]?.length > 0 ? (
                workflowData[activeTab]
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((reg) => {
                    const urgent = reg.isUrgent === true;
                    return (
                      <div
                        key={reg._id}
                        className={`bg-white border rounded-lg p-5 hover:shadow-lg transition ${
                          urgent
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-blue-600 font-bold text-sm">
                            {reg.labCode}
                          </span>
                          {urgent && (
                            <span className="px-2 py-0.5 bg-red-200 text-red-700 text-xs rounded-full border border-red-300 font-semibold">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-slate-900 font-semibold text-sm mb-3 truncate">
                          {reg.patient?.name}
                        </p>
                        <div className="space-y-2 mb-4 text-xs text-slate-600">
                          <p className="flex items-center gap-2">
                            <Smartphone size={14} />
                            {reg.patient?.mobile}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-sm font-bold">₹</span>
                            {reg.totalAmount}
                          </p>
                          <p className="flex items-center gap-2">
                            <Timer size={14} />
                            {(() => {
                              const statusChangeTime = new Date(
                                reg.updatedAt || reg.createdAt,
                              );
                              const now = new Date();
                              const diffMs = now - statusChangeTime;
                              const hours = Math.floor(
                                diffMs / (1000 * 60 * 60),
                              );
                              const minutes = Math.floor(
                                (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                              );
                              return `${hours}h ${minutes}m`;
                            })()}
                          </p>
                        </div>
                        {reg.technician && (
                          <p className="text-xs text-blue-600 mb-2 truncate flex items-center gap-2 font-medium">
                            <Users size={14} />
                            {reg.technician}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(reg.createdAt).toLocaleDateString("en-IN")}
                        </p>

                        {/* Additional Patient Info */}
                        <div className="space-y-1 mb-4 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          {reg.patient?.isRegistered && (
                            <p className="flex items-center gap-2">
                              <CheckCircle
                                size={12}
                                className="text-green-600"
                              />
                              <span className="text-green-700 font-medium">
                                Registered
                              </span>
                            </p>
                          )}
                          {reg.patient?.homeCollection && (
                            <p className="flex items-center gap-2">
                              <MapPin size={12} className="text-blue-600" />
                              <span className="text-blue-700 font-medium">
                                Home Collection
                              </span>
                            </p>
                          )}
                          {reg.patient?.collectionCenter && (
                            <p className="flex items-center gap-2">
                              <FileText size={12} />
                              <span>
                                Center: {reg.patient.collectionCenter}
                              </span>
                            </p>
                          )}
                          {reg.patient?.sampleCollectedAt && (
                            <p className="flex items-center gap-2">
                              <CheckCircle
                                size={12}
                                className="text-green-600"
                              />
                              <span>
                                Collected: {reg.patient.sampleCollectedAt}
                              </span>
                            </p>
                          )}
                          {reg.patient?.collectionRoundBoy && (
                            <p className="flex items-center gap-2">
                              <User size={12} />
                              <span>Boy: {reg.patient.collectionRoundBoy}</span>
                            </p>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                          {/* Toggle Urgent Button */}
                          <button
                            onClick={async () => {
                              try {
                                await registrationAPI.update(reg._id, {
                                  isUrgent: !reg.isUrgent,
                                });
                                toast.success(
                                  `Marked as ${!reg.isUrgent ? "urgent" : "normal"}`,
                                );
                                loadWorkflowData();
                              } catch (error) {
                                toast.error("Error updating urgent status");
                              }
                            }}
                            className={`w-full mb-2 py-2 rounded text-xs font-medium transition border ${
                              reg.isUrgent
                                ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {reg.isUrgent ? "✓ Urgent" : "Mark Urgent"}
                          </button>

                          {activeTab === "registration" && (
                            <button
                              onClick={() =>
                                updateStatus(reg._id, "Sample Pending")
                              }
                              className="w-full bg-blue-100 text-blue-700 py-2 rounded text-xs font-medium hover:bg-blue-200 transition border border-blue-300"
                            >
                              Move to Sample Pending
                            </button>
                          )}
                          {activeTab === "samplePending" && (
                            <button
                              onClick={() =>
                                updateStatus(reg._id, "Sample Collected")
                              }
                              className="w-full bg-orange-100 text-orange-700 py-2 rounded text-xs font-medium hover:bg-orange-200 transition border border-orange-300"
                            >
                              Mark Collected
                            </button>
                          )}
                          {activeTab === "sampleCollected" && (
                            <select
                              onChange={(e) => {
                                if (e.target.value)
                                  updateStatus(
                                    reg._id,
                                    "Processing",
                                    e.target.value,
                                  );
                              }}
                              className="w-full bg-slate-50 text-slate-900 py-2 rounded text-xs border border-slate-300 focus:ring-2 focus:ring-blue-500"
                              defaultValue=""
                            >
                              <option value="">Assign Tech...</option>
                              {technicians
                                .filter((t) => t.isActive)
                                .map((tech) => (
                                  <option key={tech._id} value={tech.name}>
                                    {tech.name}
                                  </option>
                                ))}
                            </select>
                          )}
                          {activeTab === "processing" && (
                            <button
                              onClick={() => handleResultEntry(reg)}
                              className="w-full bg-blue-100 text-blue-700 py-2 rounded text-xs font-medium hover:bg-blue-200 transition border border-blue-300"
                            >
                              Enter Results
                            </button>
                          )}
                          {activeTab === "reportReady" && (
                            <button
                              onClick={() => generateReport(reg)}
                              className="w-full bg-purple-100 text-purple-700 py-2 rounded text-xs font-medium hover:bg-purple-200 transition border border-purple-300"
                            >
                              Generate Report
                            </button>
                          )}
                          {activeTab === "printed" && (
                            <button
                              onClick={() => updateStatus(reg._id, "Completed")}
                              className="w-full bg-green-100 text-green-700 py-2 rounded text-xs font-medium hover:bg-green-200 transition border border-green-300"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-full text-center py-12">
                  <FileText size={48} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 font-medium">No items found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {workflowData[activeTab]?.length > itemsPerPage && (
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    workflowData[activeTab]?.length,
                  )}{" "}
                  of {workflowData[activeTab]?.length} items
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const totalPages = Math.ceil(
                        workflowData[activeTab]?.length / itemsPerPage,
                      );
                      const pages = [];
                      const maxPagesToShow = 5;
                      const halfWindow = Math.floor(maxPagesToShow / 2);

                      let startPage = Math.max(1, currentPage - halfWindow);
                      let endPage = Math.min(
                        totalPages,
                        startPage + maxPagesToShow - 1,
                      );

                      if (endPage - startPage + 1 < maxPagesToShow) {
                        startPage = Math.max(1, endPage - maxPagesToShow + 1);
                      }

                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                          >
                            1
                          </button>,
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span
                              key="ellipsis-start"
                              className="px-2 py-2 text-slate-500"
                            >
                              ...
                            </span>,
                          );
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              currentPage === i
                                ? "bg-blue-600 text-white"
                                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {i}
                          </button>,
                        );
                      }

                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span
                              key="ellipsis-end"
                              className="px-2 py-2 text-slate-500"
                            >
                              ...
                            </span>,
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                          >
                            {totalPages}
                          </button>,
                        );
                      }

                      return pages;
                    })()}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(
                            workflowData[activeTab]?.length / itemsPerPage,
                          ),
                          prev + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(workflowData[activeTab]?.length / itemsPerPage)
                    }
                    className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result Entry Modal */}
        {showResultEntry && selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Enter Test Results - {selectedRegistration.labCode}
                </h3>
                <button
                  onClick={() => setShowResultEntry(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {selectedRegistration.tests?.map((test, idx) => (
                  <div key={idx}>
                    <label className="block text-slate-900 font-medium mb-2 text-sm">
                      {test.testName}
                    </label>
                    <textarea
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter results..."
                      value={testResults[test.testName] || ""}
                      onChange={(e) =>
                        setTestResults((prev) => ({
                          ...prev,
                          [test.testName]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowResultEntry(false)}
                  className="px-6 py-2 text-slate-700 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTestResults}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
