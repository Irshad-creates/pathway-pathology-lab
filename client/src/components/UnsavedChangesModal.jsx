import { AlertTriangle, Save, LogOut } from "lucide-react";

export default function UnsavedChangesModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Unsaved Changes</h2>
              <p className="text-amber-100 text-sm mt-1">
                You have unsaved form data
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-amber-900 font-medium mb-2">Warning:</p>
            <p className="text-amber-800 text-sm">
              If you leave this page, all your unsaved form data will be lost.
              Your changes are not saved yet.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-600 font-semibold mb-2">
              What you can do:
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <Save size={16} className="text-blue-600" />
                <span>Click "Save & Continue" to save your registration</span>
              </li>
              <li className="flex items-center gap-2">
                <LogOut size={16} className="text-red-600" />
                <span>Click "Leave Page" to discard changes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-slate-50 p-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Leave Page
          </button>
        </div>
      </div>
    </div>
  );
}
