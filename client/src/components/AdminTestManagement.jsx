import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, RefreshCw, Edit2 } from "lucide-react";

export default function AdminTestManagement() {
  const [tests, setTests] = useState([
    {
      _id: "1",
      shortName: "CBC",
      name: "Complete Blood Count",
      category: "Hematology",
      price: 500,
    },
    {
      _id: "2",
      shortName: "LFT",
      name: "Liver Function Test",
      category: "Biochemistry",
      price: 800,
    },
    {
      _id: "3",
      shortName: "RFT",
      name: "Renal Function Test",
      category: "Biochemistry",
      price: 600,
    },
    {
      _id: "4",
      shortName: "TSH",
      name: "Thyroid Stimulating Hormone",
      category: "Endocrinology",
      price: 400,
    },
  ]);
  const [newTest, setNewTest] = useState({
    shortName: "",
    name: "",
    category: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [editingId, setEditingId] = useState(null);

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddTest = () => {
    if (
      !newTest.shortName ||
      !newTest.name ||
      !newTest.category ||
      !newTest.price
    ) {
      showMessage("Please fill all fields", "error");
      return;
    }

    if (editingId) {
      setTests(
        tests.map((t) =>
          t._id === editingId ? { ...newTest, _id: editingId } : t,
        ),
      );
      showMessage("Test updated successfully!", "success");
      setEditingId(null);
    } else {
      setTests([...tests, { ...newTest, _id: Date.now().toString() }]);
      showMessage("Test added successfully!", "success");
    }

    setNewTest({ shortName: "", name: "", category: "", price: "" });
  };

  const handleEditTest = (test) => {
    setNewTest(test);
    setEditingId(test._id);
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      setTests(tests.filter((t) => t._id !== testId));
      showMessage("Test deleted successfully!", "success");
    }
  };

  const handleCancel = () => {
    setNewTest({ shortName: "", name: "", category: "", price: "" });
    setEditingId(null);
  };

  const categories = [
    "Hematology",
    "Biochemistry",
    "Microbiology",
    "Endocrinology",
    "Immunology",
    "Pathology",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Test Management</h1>
        <p className="text-slate-600 mt-1">
          Manage available lab tests and pricing
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border ${messageType === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
        >
          {message}
        </div>
      )}

      {/* Add/Edit Test Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          {editingId ? "Edit Test" : "Add New Test"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Short Name
            </label>
            <input
              type="text"
              value={newTest.shortName}
              onChange={(e) =>
                setNewTest({ ...newTest, shortName: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CBC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={newTest.name}
              onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Complete Blood Count"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={newTest.category}
              onChange={(e) =>
                setNewTest({ ...newTest, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              value={newTest.price}
              onChange={(e) =>
                setNewTest({ ...newTest, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleAddTest}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Available Tests ({tests.length})
          </h3>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No tests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Short Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Full Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr
                    key={test._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {test.shortName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {test.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {test.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">
                      ₹{test.price}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTest(test)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium flex items-center gap-1"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> You can add, edit, or delete tests from here.
          These tests will be available for selection when creating new
          registrations.
        </p>
      </div>
    </div>
  );
}
