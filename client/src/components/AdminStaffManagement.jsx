import { useState, useEffect } from "react";
import {
  Users,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Lock,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { staffAPI } from "../services/api";
import { useToast } from "../hooks/useToast";

export default function AdminStaffManagement() {
  const toast = useToast();
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    username: "",
    password: "",
    role: "staff",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaffForReset, setSelectedStaffForReset] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPasswordField, setShowResetPasswordField] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedStaffForDisable, setSelectedStaffForDisable] = useState(null);
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await staffAPI.getAll();
      setStaffList(res.data);
    } catch (error) {
      console.error("Error loading staff:", error);
      showMessage("Error loading staff: " + error.message, "error");
    } finally {
      setStaffLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setStaffMessage(msg);
    setMessageType(type);
    setTimeout(() => setStaffMessage(""), 3000);
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.username || !newStaff.password) {
      showMessage("Please fill all fields", "error");
      return;
    }

    setStaffLoading(true);
    try {
      await staffAPI.create(newStaff);
      showMessage("Staff added successfully!", "success");
      setNewStaff({ name: "", username: "", password: "", role: "staff" });
      loadStaff();
    } catch (error) {
      showMessage("Error adding staff: " + error.message, "error");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleDisableClick = (staff) => {
    setSelectedStaffForDisable(staff);
    setShowDisableModal(true);
  };

  const confirmDisable = async () => {
    if (!selectedStaffForDisable) return;

    setDisableLoading(true);
    try {
      await staffAPI.disable(selectedStaffForDisable._id);
      toast.success(
        `${selectedStaffForDisable.name} has been disabled successfully!`,
      );
      setShowDisableModal(false);
      setSelectedStaffForDisable(null);
      loadStaff();
    } catch (error) {
      toast.error("Error disabling staff: " + error.message);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleResetPasswordClick = (staff) => {
    setSelectedStaffForReset(staff);
    setResetPassword("");
    setShowResetPasswordField(false);
    setShowResetModal(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedStaffForReset) return;

    if (!resetPassword || resetPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setResetLoading(true);
    try {
      await staffAPI.resetPassword(selectedStaffForReset._id, {
        newPassword: resetPassword,
      });
      toast.success(
        `Password for ${selectedStaffForReset.name} has been reset successfully!`,
      );
      setShowResetModal(false);
      setSelectedStaffForReset(null);
      setResetPassword("");
      setShowResetPasswordField(false);
      loadStaff();
    } catch (error) {
      toast.error("Error resetting password: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
        <p className="text-slate-600 mt-1">
          Manage lab staff members and their access
        </p>
      </div>

      {staffMessage && (
        <div
          className={`p-4 rounded-lg border ${messageType === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
        >
          {staffMessage}
        </div>
      )}

      {/* Add New Staff */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          Add New Staff Member
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={newStaff.name}
              onChange={(e) =>
                setNewStaff({ ...newStaff, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={newStaff.username}
              onChange={(e) =>
                setNewStaff({ ...newStaff, username: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newStaff.password}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <select
              value={newStaff.role}
              onChange={(e) =>
                setNewStaff({ ...newStaff, role: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddStaff}
              disabled={staffLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Staff Members ({staffList.length})
          </h3>
          <button
            onClick={loadStaff}
            disabled={staffLoading}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition flex items-center gap-2"
          >
            <RefreshCw
              size={18}
              className={staffLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {staffLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600">Loading staff...</p>
            </div>
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr
                    key={staff._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {staff.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {staff.username}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${staff.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {staff.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${!staff.isActive ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"}`}
                      >
                        {!staff.isActive ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetPasswordClick(staff)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium flex items-center gap-1"
                        >
                          <Lock size={14} />
                          Reset
                        </button>
                        <button
                          onClick={() => handleDisableClick(staff)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && selectedStaffForReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedStaffForReset(null);
                  setResetPassword("");
                  setShowResetPasswordField(false);
                }}
                className="text-white hover:bg-yellow-800 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Staff Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Staff Member</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedStaffForReset.name}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Username: {selectedStaffForReset.username}
                </p>
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPasswordField ? "text" : "password"}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowResetPasswordField(!showResetPasswordField)
                    }
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                  >
                    {showResetPasswordField ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Password Strength Indicator */}
              {resetPassword && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700">
                    Password length: {resetPassword.length} characters
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedStaffForReset(null);
                    setResetPassword("");
                    setShowResetPasswordField(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetPassword}
                  disabled={
                    resetLoading || !resetPassword || resetPassword.length < 6
                  }
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable Staff Modal */}
      {showDisableModal && selectedStaffForDisable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Disable Staff Member</h2>
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setSelectedStaffForDisable(null);
                }}
                className="text-white hover:bg-red-800 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Staff Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Staff Member</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedStaffForDisable.name}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Username: {selectedStaffForDisable.username}
                </p>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Are you sure?
                </p>
                <p className="text-sm text-red-700">
                  Disabling this staff member will prevent them from logging in
                  and accessing the system. This action can be reversed by
                  enabling them again.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDisableModal(false);
                    setSelectedStaffForDisable(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDisable}
                  disabled={disableLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                >
                  {disableLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Disabling...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Disable Staff
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
