import { useState, useEffect } from "react";
import TopHeader from "../components/TopHeader";
import Navbar from "../components/Navbar";
import { useToast } from "../hooks/useToast";
import { Plus, Trash2, Edit3, Save, X, Users, AlertCircle } from "lucide-react";

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState(null);
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    specialization: "",
  });

  // Load technicians on mount
  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/staff/technicians/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTechnicians(data);
    } catch (error) {
      toast.error("Error loading technicians");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/staff/technician", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create technician");
      }

      toast.success("Technician created successfully!");
      setFormData({
        name: "",
        username: "",
        password: "",
        specialization: "",
      });
      setShowForm(false);
      loadTechnicians();
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tech) => {
    setTechnicianToDelete(tech);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!technicianToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/staff/${technicianToDelete._id}/disable`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete technician");
      }

      toast.success("Technician deleted successfully!");
      setShowDeleteModal(false);
      setTechnicianToDelete(null);
      loadTechnicians();
    } catch (error) {
      toast.error("Error: " + error.message);
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
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Users size={28} />
                </div>
                Technician Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage lab technicians and staff members
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg font-semibold"
            >
              <Plus size={20} />
              Add Technician
            </button>
          </div>
        </div>

        {/* Add Technician Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-8 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full opacity-10 -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus size={24} className="text-blue-600" />
                Create New Technician
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Dr. Rajesh Kumar"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., rajesh_kumar"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior Pathologist"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition font-semibold"
                  >
                    <Save size={18} />
                    Create Technician
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition font-semibold"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Technicians List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Technicians List
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Specialization
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && technicians.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-slate-600 mt-2">
                        Loading technicians...
                      </p>
                    </td>
                  </tr>
                ) : technicians.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <AlertCircle
                        size={32}
                        className="mx-auto text-slate-400 mb-2"
                      />
                      <p className="text-slate-600">
                        No technicians found. Click "Add Technician" to create
                        one.
                      </p>
                    </td>
                  </tr>
                ) : (
                  technicians.map((tech) => (
                    <tr
                      key={tech._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {tech.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {tech.username}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {tech.specialization || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            tech.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tech.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteClick(tech)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition disabled:opacity-50"
                          title="Delete Technician"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">
                Total Technicians:{" "}
                <span className="text-blue-600 text-lg">
                  {technicians.length}
                </span>
              </p>
              <p className="text-slate-600 text-sm mt-2">
                Technicians will appear in the "Assign Technician" dropdown in
                Lab Workflow when you move samples to "Sample Collected" stage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && technicianToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Delete Technician</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTechnicianToDelete(null);
                }}
                className="text-white hover:bg-red-800 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">Are you sure?</p>
                <p className="text-red-700 text-sm">
                  You are about to delete technician{" "}
                  <span className="font-bold">{technicianToDelete.name}</span>.
                  This action cannot be undone.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 mb-2">
                  Technician Details:
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-slate-600">Name:</span>{" "}
                    <span className="font-semibold">
                      {technicianToDelete.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Username:</span>{" "}
                    <span className="font-semibold">
                      {technicianToDelete.username}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Specialization:</span>{" "}
                    <span className="font-semibold">
                      {technicianToDelete.specialization || "-"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTechnicianToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete Technician
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
