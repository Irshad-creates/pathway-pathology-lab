import { useState } from "react";
import { Search, RotateCcw, Printer, Download, Eye } from "lucide-react";

export default function SearchForm({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  loading,
  selectedCount,
  totalResults,
  onPrintAll,
  onPrintSelected,
  onExport,
  onViewPaymentHistory,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      {/* Main Search Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={onSearch} className="space-y-6">
          {/* Quick Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Quick Search
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="patientName"
                  value={filters.patientName}
                  onChange={onFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Patient name..."
                />
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="labCode"
                  value={filters.labCode}
                  onChange={onFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lab code..."
                />
              </div>
              <select
                name="status"
                value={filters.status}
                onChange={onFilterChange}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Registration">Registration</option>
                <option value="Sample Pending">Sample Pending</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="Processing">Processing</option>
                <option value="Report Ready">Report Ready</option>
                <option value="Printed">Printed</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              {showAdvanced ? "▼" : "▶"} Advanced Filters
            </button>
            {showAdvanced && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={filters.fromDate}
                      onChange={onFilterChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={filters.toDate}
                      onChange={onFilterChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center gap-2"
            >
              <Search size={18} />
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results Info & Actions */}
      {totalResults > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-slate-600">Total Results</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalResults}
                </p>
              </div>
              {selectedCount > 0 && (
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedCount} selected
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={onPrintAll}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium flex items-center gap-2"
              >
                <Printer size={18} />
                Print All
              </button>
              <button
                onClick={onPrintSelected}
                disabled={selectedCount === 0}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
              >
                <Printer size={18} />
                Print ({selectedCount})
              </button>
              <button
                onClick={onExport}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium flex items-center gap-2"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button
                onClick={onViewPaymentHistory}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium flex items-center gap-2"
              >
                <Eye size={18} />
                Payment History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Use the search filters to find specific
          registrations. You can search by patient name, lab code, date range,
          or status. Select multiple registrations to print worksheets or export
          data.
        </p>
      </div>
    </div>
  );
}
