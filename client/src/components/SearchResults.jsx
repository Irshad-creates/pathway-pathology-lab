import {
  Printer,
  Trash2,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SearchResults({
  results,
  loading,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onPrint,
  onDelete,
  onPayment,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  getStatusColor,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex justify-center items-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">No registrations found</p>
          <p className="text-slate-500 text-sm mt-2">
            Try adjusting your search filters
          </p>
        </div>
      </div>
    );
  }

  const allCurrentPageSelected = results.every((r) => selectedRows.has(r._id));

  return (
    <div className="space-y-6">
      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Lab Code
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Patient Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Age
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Mobile
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Payment
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((reg) => (
                <tr
                  key={reg._id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(reg._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onRowSelect(reg._id);
                      }}
                      className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {reg.labCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-medium">
                    {reg.patient?.name || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {reg.patient?.age} {reg.patient?.ageUnit}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {reg.patient?.mobile || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">
                    ₹{reg.totalAmount?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600">
                        {reg.paymentMethod || "Pending"}
                      </span>
                      {reg.balanceAmount > 0 && (
                        <span className="text-xs font-semibold text-orange-600">
                          Balance: ₹{reg.balanceAmount?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(reg);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onPrint === "function") {
                            onPrint(reg);
                          }
                        }}
                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                      {reg.balanceAmount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPayment(reg);
                          }}
                          className="p-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                          title="Collect Payment"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(reg);
                        }}
                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            Page{" "}
            <span className="font-semibold text-slate-900">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              const maxVisible = 5;
              const start = Math.max(
                1,
                currentPage - Math.floor(maxVisible / 2),
              );
              const end = Math.min(totalPages, start + maxVisible - 1);
              return page >= start && page <= end;
            })
            .map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg transition ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
