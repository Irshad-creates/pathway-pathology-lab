import { useState, useEffect, useRef } from "react";
import {
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Printer,
  Scan,
  FileText,
  Calendar,
  Timer,
  Users,
  BarChart3,
  Settings,
  Download,
  Upload,
  Eye,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Bell,
  Microscope,
  TestTube,
  ClipboardCheck,
  Send,
  Phone,
} from "lucide-react";

export default function LabWorkflowEnhanced({
  workflowData,
  activeTab,
  setActiveTab,
  updateStatus,
  batchMode,
  selectedBatch,
  toggleBatchSelection,
  processBatch,
  technicians,
  handleResultEntry,
  generateReport,
  isUrgent,
}) {
  const renderRegistrationCard = (reg, actions) => {
    const urgent = isUrgent(reg);
    const isSelected = selectedBatch.includes(reg._id);

    return (
      <div
        key={reg._id}
        className={`bg-white border rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${
          urgent ? "border-red-300 bg-red-50" : "border-gray-200"
        } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      >
        {/* Batch Mode Checkbox */}
        {batchMode && (
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleBatchSelection(reg._id)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              Select for batch processing
            </span>
          </div>
        )}

        {/* Header with Lab Code and Patient Info */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-lg text-blue-600">{reg.labCode}</h3>
              {urgent && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  URGENT
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-900">{reg.patient?.name}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {reg.patient?.mobile}
              </span>
              <span className="flex items-center gap-1">
                <User size={14} />
                {reg.patient?.age}Y, {reg.patient?.gender}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600 text-lg">
              ₹{reg.totalAmount}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(reg.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(reg.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Tests List */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Tests Ordered:
          </p>
          <div className="flex flex-wrap gap-1">
            {reg.tests?.slice(0, 4).map((test, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {test.testName}
              </span>
            ))}
            {reg.tests?.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{reg.tests.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Technician Info */}
        {reg.technician && (
          <div className="mb-3 flex items-center text-sm">
            <User size={14} className="mr-2 text-gray-500" />
            <span className="font-medium text-gray-700">Assigned to: </span>
            <span className="text-blue-600 ml-1">{reg.technician}</span>
          </div>
        )}

        {/* Processing Time */}
        <div className="mb-3 flex items-center text-sm text-gray-600">
          <Timer size={14} className="mr-2" />
          <span>
            Processing time:{" "}
            {Math.floor(
              (new Date() - new Date(reg.createdAt)) / (1000 * 60 * 60),
            )}
            h
            {Math.floor(
              ((new Date() - new Date(reg.createdAt)) % (1000 * 60 * 60)) /
                (1000 * 60),
            )}
            m
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">{actions}</div>
      </div>
    );
  };

  const renderTabContent = () => {
    const currentData = workflowData[activeTab] || [];

    if (currentData.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">
            No registrations in this stage
          </p>
          <p className="text-gray-400 text-sm">
            Items will appear here as they move through the workflow
          </p>
        </div>
      );
    }

    return currentData.map((reg) => {
      let actions = [];

      switch (activeTab) {
        case "samplePending":
          actions = [
            <button
              key="collect"
              onClick={() => updateStatus(reg._id, "Sample Collected")}
              className="flex-1 bg-orange-600 text-white py-2 px-3 rounded text-sm hover:bg-orange-700 flex items-center justify-center"
            >
              <TestTube size={16} className="mr-1" />
              Mark Collected
            </button>,
            <button
              key="view"
              onClick={() => alert(`Viewing details for ${reg.labCode}`)}
              className="bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-300"
            >
              <Eye size={16} />
            </button>,
          ];
          break;

        case "sampleCollected":
          actions = [
            <select
              key="technician"
              onChange={(e) => {
                if (e.target.value) {
                  updateStatus(reg._id, "Processing", e.target.value);
                }
              }}
              className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm"
              defaultValue=""
            >
              <option value="">Assign Technician</option>
              {technicians
                .filter((t) => t.active)
                .map((tech) => (
                  <option key={tech.id} value={tech.name}>
                    {tech.name} - {tech.role}
                  </option>
                ))}
            </select>,
            <button
              key="priority"
              onClick={() => alert("Marked as priority")}
              className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200"
            >
              🚨 Priority
            </button>,
          ];
          break;

        case "processing":
          actions = [
            <button
              key="results"
              onClick={() => handleResultEntry(reg)}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
            >
              <Edit3 size={16} className="mr-1" />
              Enter Results
            </button>,
            <button
              key="ready"
              onClick={() => updateStatus(reg._id, "Report Ready")}
              className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 flex items-center justify-center"
            >
              <CheckCircle size={16} className="mr-1" />
              Mark Ready
            </button>,
          ];
          break;

        case "reportReady":
          actions = [
            <button
              key="generate"
              onClick={() => generateReport(reg)}
              className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 flex items-center justify-center"
            >
              <FileText size={16} className="mr-1" />
              Generate Report
            </button>,
            <button
              key="preview"
              onClick={() => alert("Report preview")}
              className="bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-300"
            >
              <Eye size={16} />
            </button>,
          ];
          break;

        case "printed":
          actions = [
            <button
              key="deliver"
              onClick={() => updateStatus(reg._id, "Completed")}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 flex items-center justify-center"
            >
              <Send size={16} className="mr-1" />
              Mark Delivered
            </button>,
            <button
              key="reprint"
              onClick={() => alert("Reprinting report")}
              className="bg-blue-200 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-300"
            >
              <Printer size={16} />
            </button>,
          ];
          break;

        case "completed":
          actions = [
            <button
              key="archive"
              onClick={() => alert("Archived")}
              className="bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-300"
            >
              Archive
            </button>,
            <button
              key="feedback"
              onClick={() => alert("Patient feedback")}
              className="bg-blue-200 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-300"
            >
              Feedback
            </button>,
          ];
          break;

        default:
          actions = [];
      }

      return renderRegistrationCard(reg, actions);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderTabContent()}
    </div>
  );
}
