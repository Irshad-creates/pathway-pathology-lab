import { useState, useEffect } from "react";
import { CreditCard, Save, RefreshCw } from "lucide-react";
import { settingsAPI } from "../services/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    labName: "",
    upiId: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    reportGenerationTime: "tomorrow",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.get();
      setSettings(res.data);
    } catch (error) {
      console.error("Error loading settings:", error);
      showMessage("Error loading settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.update(settings);
      showMessage("Settings saved successfully!", "success");
    } catch (error) {
      showMessage("Error saving settings: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Lab Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure your lab information and preferences
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border ${messageType === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
        >
          {message}
        </div>
      )}

      {/* Lab Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <CreditCard size={20} className="text-blue-600" />
          Lab Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lab Name
            </label>
            <input
              type="text"
              name="labName"
              value={settings.labName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Lab Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={settings.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="lab@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={settings.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City Name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full address"
            />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <CreditCard size={20} className="text-green-600" />
          Payment Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              name="upiId"
              value={settings.upiId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="9876543210@upi"
            />
            <p className="text-xs text-slate-500 mt-1">
              Format: 9876543210@upi or name@bank
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Report Generation Time
            </label>
            <input
              type="text"
              name="reportGenerationTime"
              value={settings.reportGenerationTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., tomorrow, 24 hours"
            />
            <p className="text-xs text-slate-500 mt-1">
              When to generate daily reports
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={loadSettings}
          disabled={loading}
          className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium flex items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Reset
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> These settings are used for generating reports,
          payment processing, and lab identification. Make sure all information
          is accurate.
        </p>
      </div>
    </div>
  );
}
