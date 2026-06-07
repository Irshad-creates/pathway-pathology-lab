import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import { AuthContext } from "../context/AuthContext";
import { useRealtime } from "../context/RealtimeContext";
import { useToast } from "../hooks/useToast";
import { patientPortalAPI, settingsAPI } from "../services/api";
import {
  Clock,
  FileText,
  User,
  Calendar,
  TestTube,
  CreditCard,
  Download,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Microscope,
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isConnected, joinRoom, onUpdate, offUpdate } = useRealtime();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [patientData, setPatientData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [labStatus, setLabStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [realtimeUpdate, setRealtimeUpdate] = useState(null);
  const [labSettings, setLabSettings] = useState(null);

  useEffect(() => {
    loadPatientData();
    loadLabStatus();
    loadLabSettings();

    // Join registrations room for real-time updates
    joinRoom("registrations");

    const handleRegistrationUpdated = (data) => {
      setRealtimeUpdate(`Test status updated: ${data.registration.labCode}`);
      setTimeout(() => setRealtimeUpdate(null), 3000);

      // Update the registration in the list
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === data.registration._id ? data.registration : reg,
        ),
      );
    };

    const handleStatusUpdated = (data) => {
      setRealtimeUpdate(
        `Status updated: ${data.oldStatus} to ${data.newStatus}`,
      );
      setTimeout(() => setRealtimeUpdate(null), 3000);

      // Update the registration in the list
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === data.registration._id ? data.registration : reg,
        ),
      );
    };

    onUpdate("registration-updated", handleRegistrationUpdated);
    onUpdate("status-updated", handleStatusUpdated);

    return () => {
      offUpdate("registration-updated");
      offUpdate("status-updated");
    };
  }, [joinRoom, onUpdate, offUpdate]);

  const loadPatientData = async () => {
    try {
      const res = await patientPortalAPI.getMyTests();
      setPatientData(res.data.patient);
      setRegistrations(res.data.registrations);
      setProfileData({
        email: res.data.patient.email || "",
        address: res.data.patient.address || "",
        city: res.data.patient.city || "",
        age: res.data.patient.age || "",
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadLabStatus = async () => {
    try {
      const res = await patientPortalAPI.getLabStatus();
      setLabStatus(res.data);
    } catch (error) {}
  };

  const loadLabSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setLabSettings(res.data);
    } catch (error) {
      // Set default settings if loading fails
      setLabSettings({
        labName: "Pathology Lab",
        address: "Lab Address",
        phone: "+91-XXXXXXXXXX",
        email: "lab@example.com",
      });
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await patientPortalAPI.updateProfile(profileData);
      setPatientData((prev) => ({ ...prev, ...profileData }));
      setProfileEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast("Error updating profile: " + error.message, "error");
    }
  };

  const downloadReport = async (registration) => {
    try {
      // Import reportGenerator
      const { generateLabReport } = await import("../services/reportGenerator");

      // Ensure registration has patient data
      let regWithPatient = registration;
      if (!registration.patient || typeof registration.patient === "string") {
        // If patient is not populated, fetch it
        const res = await patientPortalAPI.getRegistration(registration._id);
        regWithPatient = res.data;
      }

      // Generate PDF with actual test results from registration.results
      const result = await generateLabReport(
        regWithPatient,
        regWithPatient.results || {}, // Use actual test results from registration
        labSettings || {
          labName: "Pathology Lab",
          address: "Lab Address",
          phone: "+91-XXXXXXXXXX",
          email: "lab@example.com",
          licenseNumber: "N/A",
        },
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      showToast("Report downloaded successfully!", "success");
    } catch (error) {
      showToast("Error downloading report: " + error.message, "error");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Registration":
        return <AlertCircle className="text-red-500" size={16} />;
      case "Sample Pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "Sample Collected":
        return <TestTube className="text-orange-500" size={16} />;
      case "Processing":
        return <Microscope className="text-blue-500" size={16} />;
      case "Report Ready":
        return <FileText className="text-purple-500" size={16} />;
      case "Printed":
        return <FileText className="text-indigo-500" size={16} />;
      case "Completed":
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <XCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Registration":
        return "bg-red-100 text-red-800";
      case "Sample Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Sample Collected":
        return "bg-orange-100 text-orange-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Report Ready":
        return "bg-purple-100 text-purple-800";
      case "Printed":
        return "bg-indigo-100 text-indigo-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader hideSearch={true} hideWallet={true} />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {patientData?.name}</h1>
            <p className="text-gray-600">Patient Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            {realtimeUpdate && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm animate-pulse">
                {realtimeUpdate}
              </div>
            )}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="text-green-500" size={20} />
                  <span className="text-sm text-green-600">Live updates</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-red-500" size={20} />
                  <span className="text-sm text-red-600">Connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lab Status */}
        {labStatus && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock
                  size={24}
                  className={
                    labStatus.isOpen ? "text-green-500" : "text-red-500"
                  }
                />
                <div>
                  <h2 className="text-xl font-semibold">Lab Status</h2>
                  <p className="text-gray-600">{labStatus.hours}</p>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  labStatus.isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {labStatus.isOpen ? "OPEN" : "CLOSED"}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: Calendar },
                { id: "tests", label: "Test History", icon: TestTube },
                { id: "profile", label: "My Profile", icon: User },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

              {/* Payment Due Alert */}
              {registrations.some((r) => r.balanceAmount > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="text-red-600 mr-3 mt-1" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800 mb-2">
                        Payment Due
                      </h3>
                      <p className="text-red-700 text-sm mb-3">
                        You have pending payments for the following tests:
                      </p>
                      <div className="space-y-2">
                        {registrations
                          .filter((r) => r.balanceAmount > 0)
                          .map((reg) => (
                            <div
                              key={reg._id}
                              className="flex justify-between items-center bg-white p-3 rounded border border-red-100"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {reg.labCode}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {reg.tests.map((t) => t.testName).join(", ")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-red-600">
                                  ₹{reg.balanceAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Balance Due
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                      <p className="text-xs text-red-600 mt-3">
                        Please contact the lab or visit the Search page to make
                        payment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <TestTube className="text-blue-600 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Total Tests</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {registrations.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {
                          registrations.filter((r) => r.status === "Completed")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="text-yellow-600 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {
                          registrations.filter(
                            (r) =>
                              r.status === "Pending" ||
                              r.status === "Registration",
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="text-purple-600 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹
                        {registrations.reduce(
                          (sum, r) => sum + (r.paidAmount || 0),
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tests */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
                <div className="space-y-3">
                  {registrations.slice(0, 5).map((registration) => (
                    <div
                      key={registration._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(registration.status)}
                        <div>
                          <p className="font-medium">{registration.labCode}</p>
                          <p className="text-sm text-gray-600">
                            {registration.tests
                              .map((t) => t.testName)
                              .join(", ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              registration.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${getStatusColor(registration.status)}`}
                        >
                          {registration.status}
                        </span>
                        <span className="font-medium">
                          ₹{registration.paidAmount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Test History Tab */}
          {activeTab === "tests" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Test History</h2>

              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <TestTube className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500">No test history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <div
                      key={registration._id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {registration.labCode}
                          </h3>
                          <p className="text-gray-600">
                            {new Date(
                              registration.createdAt,
                            ).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(registration.status)}`}
                          >
                            {registration.status}
                          </span>
                          {registration.status === "Completed" && (
                            <button
                              onClick={() => downloadReport(registration)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                              <Download size={16} />
                              <span className="text-sm">Download</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Tests Performed</h4>
                          <ul className="space-y-1">
                            {registration.tests.map((test, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 flex justify-between"
                              >
                                <span>{test.testName}</span>
                                <span>₹{test.price}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Payment Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span>₹{registration.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount:</span>
                              <span>₹{registration.discountTest || 0}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Paid Amount:</span>
                              <span>₹{registration.paidAmount}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Payment Method:</span>
                              <span>{registration.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {registration.comment && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">
                            <strong>Note:</strong> {registration.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <button
                  onClick={() => setProfileEditing(!profileEditing)}
                  className="btn-primary"
                >
                  {profileEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={patientData?.name || ""}
                      className="form-input bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Name cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      value={patientData?.mobile || ""}
                      className="form-input bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mobile number cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="form-input"
                      disabled={!profileEditing}
                    />
                  </div>

                  <div>
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      value={profileData.age}
                      onChange={(e) =>
                        setProfileData({ ...profileData, age: e.target.value })
                      }
                      className="form-input"
                      disabled={!profileEditing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Gender</label>
                    <input
                      type="text"
                      value={patientData?.gender || ""}
                      className="form-input bg-gray-100"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label">Address</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      className="form-input h-24"
                      disabled={!profileEditing}
                    />
                  </div>

                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) =>
                        setProfileData({ ...profileData, city: e.target.value })
                      }
                      className="form-input"
                      disabled={!profileEditing}
                    />
                  </div>
                </div>
              </div>

              {profileEditing && (
                <div className="mt-6 flex space-x-4">
                  <button onClick={handleProfileUpdate} className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setProfileEditing(false);
                      setProfileData({
                        email: patientData?.email || "",
                        address: patientData?.address || "",
                        city: patientData?.city || "",
                        age: patientData?.age || "",
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
