import { useState, useEffect } from "react";
import TopHeader from "../components/TopHeader";
import Navbar from "../components/Navbar";
import SearchForm from "../components/SearchForm";
import SearchResults from "../components/SearchResults";
import RegistrationDetails from "../components/RegistrationDetails";
import { registrationAPI, settingsAPI } from "../services/api";
import { useToast } from "../hooks/useToast";
import { Wifi, WifiOff, X, CheckCircle } from "lucide-react";
import { useRealtime } from "../context/RealtimeContext";

export default function Search() {
  const { isConnected, joinRoom, onUpdate, offUpdate } = useRealtime();
  const toast = useToast();
  const [filters, setFilters] = useState({
    patientName: "",
    labCode: "",
    fromDate: "",
    toDate: "",
    status: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [realtimeUpdate, setRealtimeUpdate] = useState(null);
  const [labSettings, setLabSettings] = useState(() => {
    // Initialize from localStorage to avoid flash
    try {
      const cached = localStorage.getItem("labSettings");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalResults, setTotalResults] = useState(0);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);

  const loadLabSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setLabSettings(res.data);
      // Cache in localStorage for persistence across navigation
      localStorage.setItem("labSettings", JSON.stringify(res.data));
    } catch (error) {
      // Use cached settings if API fails
    }
  };

  useEffect(() => {
    loadLabSettings();
    loadRegistrations();
  }, []);

  useEffect(() => {
    joinRoom("registrations");

    const handleRegistrationCreated = (data) => {
      setRealtimeUpdate(`New registration: ${data.registration.labCode}`);
      setTimeout(() => setRealtimeUpdate(null), 3000);
      setResults((prev) => [data.registration, ...prev]);
    };

    const handleRegistrationUpdated = (data) => {
      setRealtimeUpdate(`Registration updated: ${data.registration.labCode}`);
      setTimeout(() => setRealtimeUpdate(null), 3000);
      setResults((prev) =>
        prev.map((reg) =>
          reg._id === data.registration._id ? data.registration : reg,
        ),
      );
    };

    const handleRegistrationDeleted = (data) => {
      setRealtimeUpdate(`Registration deleted`);
      setTimeout(() => setRealtimeUpdate(null), 3000);
      setResults((prev) =>
        prev.filter((reg) => reg._id !== data.registrationId),
      );
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.registrationId);
        return newSet;
      });
    };

    onUpdate("registration-created", handleRegistrationCreated);
    onUpdate("registration-updated", handleRegistrationUpdated);
    onUpdate("registration-deleted", handleRegistrationDeleted);

    return () => {
      offUpdate("registration-created");
      offUpdate("registration-updated");
      offUpdate("registration-deleted");
    };
  }, [joinRoom, onUpdate, offUpdate]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await registrationAPI.search({});
      // Sort by createdAt descending (newest first)
      const sortedResults = res.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setResults(sortedResults);
      setTotalResults(sortedResults.length);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load registrations: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchFilters) => {
    setLoading(true);
    try {
      const res = await registrationAPI.search(searchFilters);
      // Sort by createdAt descending (newest first)
      const sortedResults = res.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setResults(sortedResults);
      setTotalResults(sortedResults.length);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      patientName: "",
      labCode: "",
      fromDate: "",
      toDate: "",
      status: "",
    });
    setResults([]);
    setSelectedRows(new Set());
    setCurrentPage(1);
    loadRegistrations();
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    const currentPageResults = getPaginatedResults();
    const currentPageIds = currentPageResults.map((r) => r._id);
    const allCurrentPageSelected = currentPageIds.every((id) =>
      selectedRows.has(id),
    );

    if (allCurrentPageSelected) {
      const newSelected = new Set(selectedRows);
      currentPageIds.forEach((id) => newSelected.delete(id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      currentPageIds.forEach((id) => newSelected.add(id));
      setSelectedRows(newSelected);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Registration":
        return "bg-blue-100 text-blue-800";
      case "Sample Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Sample Collected":
        return "bg-orange-100 text-orange-800";
      case "Processing":
        return "bg-purple-100 text-purple-800";
      case "Report Ready":
        return "bg-green-100 text-green-800";
      case "Printed":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePrintAll = async () => {
    // Print only current page results to avoid performance issues
    const currentPageResults = getPaginatedResults();

    if (currentPageResults.length === 0) {
      toast.warning("No registrations to print on this page");
      return;
    }

    try {
      const { generateReportHTML } =
        await import("../services/reportGenerator");
      const { settingsAPI } = await import("../services/api");

      // Fetch lab settings
      const settingsRes = await settingsAPI.get();
      const labSettings = settingsRes.data;

      // Extract styles from the first report
      const firstReportHTML = generateReportHTML(
        currentPageResults[0],
        currentPageResults[0].results || {},
        labSettings,
      );

      let extractedStyles = "";
      const styleMatch = firstReportHTML.match(
        /<style[^>]*>([\s\S]*?)<\/style>/i,
      );
      if (styleMatch && styleMatch[1]) {
        extractedStyles = styleMatch[1];
      }

      // Create combined HTML
      let combinedHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
${extractedStyles}
body {
  margin: 0;
  padding: 0;
}
.report-container {
  page-break-after: always;
}
.report-container:last-child {
  page-break-after: auto;
  margin-bottom: 0;
  padding-bottom: 0;
}
@media print {
  body {
    margin: 0;
    padding: 0;
  }
}
</style>
</head>
<body>`;

      // Add each registration's report
      currentPageResults.forEach((registration) => {
        try {
          const reportHTML = generateReportHTML(
            registration,
            registration.results || {},
            labSettings,
          );

          // Extract just the body content
          const bodyMatch = reportHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          let bodyContent = bodyMatch ? bodyMatch[1] : "";

          // Remove extra whitespace at the end
          bodyContent = bodyContent.trim();

          combinedHTML += `<div class="report-container">${bodyContent}</div>`;
        } catch (err) {
          // Error generating report for this registration
        }
      });

      combinedHTML += `</body>
</html>`;

      // Open in new window and print
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(combinedHTML);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        toast.error(
          "Could not open print window. Please check popup blocker settings.",
        );
      }

      toast.success(
        `Opening print preview for ${currentPageResults.length} registration(s) on this page...`,
      );
    } catch (error) {
      toast.error("Error opening print preview: " + error.message);
    }
  };

  const handlePrintWorksheet = async () => {
    if (selectedRows.size === 0) {
      toast.warning("Please select at least one registration to print");
      return;
    }

    try {
      const { generateReportHTML } =
        await import("../services/reportGenerator");
      const { settingsAPI } = await import("../services/api");

      // Fetch lab settings
      const settingsRes = await settingsAPI.get();
      const labSettings = settingsRes.data;

      // Get selected registrations
      const selectedRegistrations = results.filter((r) =>
        selectedRows.has(r._id),
      );

      // Extract styles from the first report
      const firstReportHTML = generateReportHTML(
        selectedRegistrations[0],
        selectedRegistrations[0].results || {},
        labSettings,
      );

      let extractedStyles = "";
      const styleMatch = firstReportHTML.match(
        /<style[^>]*>([\s\S]*?)<\/style>/i,
      );
      if (styleMatch && styleMatch[1]) {
        extractedStyles = styleMatch[1];
      }

      // Create combined HTML
      let combinedHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
${extractedStyles}
body {
  margin: 0;
  padding: 0;
}
.report-container {
  page-break-after: always;
}
.report-container:last-child {
  page-break-after: auto;
  margin-bottom: 0;
  padding-bottom: 0;
}
@media print {
  body {
    margin: 0;
    padding: 0;
  }
}
</style>
</head>
<body>`;

      // Add each registration's report
      selectedRegistrations.forEach((registration, index) => {
        const reportHTML = generateReportHTML(
          registration,
          registration.results || {},
          labSettings,
        );

        // Extract just the body content
        const bodyMatch = reportHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let bodyContent = bodyMatch ? bodyMatch[1] : "";

        // Remove extra whitespace at the end
        bodyContent = bodyContent.trim();

        combinedHTML += `<div class="report-container">${bodyContent}</div>`;
      });

      combinedHTML += `</body>
</html>`;

      // Open in new window and print
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(combinedHTML);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      toast.success(
        `Opening print preview for ${selectedRegistrations.length} registration(s)...`,
      );
    } catch (error) {
      toast.error("Error opening print preview: " + error.message);
    }
  };

  const handleDeleteClick = async (registration) => {
    setRegistrationToDelete(registration);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!registrationToDelete) return;

    try {
      await registrationAPI.delete(registrationToDelete._id);
      toast.success(
        `Registration ${registrationToDelete.labCode} deleted successfully`,
      );
      setShowDeleteModal(false);
      setRegistrationToDelete(null);
      loadRegistrations();
    } catch (error) {
      toast.error(
        "Error deleting registration: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleCollectPayment = (registration) => {
    setSelectedForPayment(registration);
    setPaymentAmount(registration.balanceAmount || 0);
    setPaymentMethod("Cash");
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!selectedForPayment || paymentAmount <= 0) {
      toast.warning("Please enter a valid payment amount");
      return;
    }

    try {
      // Update registration with new payment
      const amount = parseFloat(paymentAmount);
      const updatedPaidAmount = (selectedForPayment.paidAmount || 0) + amount;
      const updatedBalanceAmount = Math.max(
        0,
        selectedForPayment.totalAmount - updatedPaidAmount,
      );

      // Check if full payment is made
      const isFullPayment = updatedPaidAmount >= selectedForPayment.totalAmount;
      const newStatus = isFullPayment
        ? "Sample Pending"
        : selectedForPayment.status;

      await registrationAPI.update(selectedForPayment._id, {
        paidAmount: updatedPaidAmount,
        balanceAmount: updatedBalanceAmount,
        paymentMethod: paymentMethod,
        status: newStatus,
      });

      toast.success(
        `Payment of ₹${amount.toLocaleString()} collected successfully!${isFullPayment ? " Status changed to Sample Pending." : ""}`,
      );
      setShowPaymentModal(false);
      setSelectedForPayment(null);
      setPaymentAmount(0);
      setPaymentMethod("Cash");
      loadRegistrations(); // Refresh the list
    } catch (error) {
      toast.error("Error collecting payment: " + error.message);
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetails(true);
  };

  const getPaginatedResults = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(totalResults / itemsPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedRows(new Set());
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedRows(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopHeader />
      <Navbar />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header with Real-time Status */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Search</h1>
            <p className="text-slate-600 mt-1">
              Find and manage patient registrations
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
            {isConnected ? (
              <>
                <Wifi className="text-green-500" size={18} />
                <span className="text-sm text-green-600">Live updates</span>
              </>
            ) : (
              <>
                <WifiOff className="text-red-500" size={18} />
                <span className="text-sm text-red-600">Connecting...</span>
              </>
            )}
          </div>
        </div>

        {/* Real-time Update Notification */}
        {realtimeUpdate && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg animate-pulse">
            {realtimeUpdate}
          </div>
        )}

        {/* Search Form */}
        <SearchForm
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
          selectedCount={selectedRows.size}
          totalResults={totalResults}
          onPrintAll={handlePrintAll}
          onPrintSelected={handlePrintWorksheet}
          onExport={() => {
            // Create CSV with headers
            const headers = [
              "Lab Code",
              "Patient Name",
              "Age",
              "Gender",
              "Mobile",
              "Total Amount",
              "Paid Amount",
              "Balance",
              "Status",
              "Payment Method",
            ];
            const csvContent = [
              headers.join(","),
              ...results.map((r) =>
                [
                  r.labCode || "",
                  r.patient?.name || "",
                  r.patient?.age || "",
                  r.patient?.gender || "",
                  r.patient?.mobile || "",
                  r.totalAmount || 0,
                  r.paidAmount || 0,
                  r.balanceAmount || 0,
                  r.status || "",
                  r.paymentMethod || "",
                ]
                  .map((field) => `"${field}"`)
                  .join(","),
              ),
            ].join("\n");

            const blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `registrations_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            toast.success("Exported to CSV");
          }}
          onViewPaymentHistory={() => {
            setShowPaymentHistory(true);
          }}
        />

        {/* Search Results */}
        <SearchResults
          results={getPaginatedResults()}
          loading={loading}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onPrint={async (registration) => {
            try {
              const { printLabReport } =
                await import("../services/reportGenerator");
              const { settingsAPI } = await import("../services/api");

              // Fetch lab settings
              const settingsRes = await settingsAPI.get();
              const labSettings = settingsRes.data;

              // Open print preview
              const result = printLabReport(
                registration,
                registration.results || {},
                labSettings,
              );

              if (!result.success) {
                toast.error(result.message);
              }
            } catch (error) {
              toast.error("Error opening print preview: " + error.message);
            }
          }}
          onDelete={handleDeleteClick}
          onPayment={handleCollectPayment}
          onViewDetails={handleViewDetails}
          currentPage={currentPage}
          totalPages={getTotalPages()}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          getStatusColor={getStatusColor}
        />
      </div>

      {/* Registration Details Modal */}
      {showDetails && (
        <RegistrationDetails
          registration={selectedRegistration}
          onClose={() => setShowDetails(false)}
          onPrint={async () => {
            try {
              const { printLabReport } =
                await import("../services/reportGenerator");
              const { settingsAPI } = await import("../services/api");

              // Fetch lab settings
              const settingsRes = await settingsAPI.get();
              const labSettings = settingsRes.data;

              // Open print preview
              const result = printLabReport(
                selectedRegistration,
                selectedRegistration.results || {},
                labSettings,
              );

              if (!result.success) {
                toast.error(result.message);
              }
            } catch (error) {
              toast.error("Error opening print preview: " + error.message);
            }
          }}
          onPayment={() => {
            handleCollectPayment(selectedRegistration);
          }}
        />
      )}

      {/* Payment Collection Modal */}
      {showPaymentModal && selectedForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Collect Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:bg-purple-800 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Patient Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Patient</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedForPayment.patient?.name}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Lab Code: {selectedForPayment.labCode}
                </p>
              </div>

              {/* Amount Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">Total Amount</p>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{selectedForPayment.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">Balance Due</p>
                  <p className="text-lg font-bold text-orange-600">
                    ₹{selectedForPayment.balanceAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(
                      Math.min(
                        parseFloat(e.target.value) || 0,
                        selectedForPayment.balanceAmount,
                      ),
                    )
                  }
                  max={selectedForPayment.balanceAmount}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Max: ₹{selectedForPayment.balanceAmount?.toLocaleString()}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayment}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Collect Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment History</h2>
              <button
                onClick={() => setShowPaymentHistory(false)}
                className="text-white hover:bg-blue-800 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Summary at Top */}
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹
                    {results
                      .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹
                    {results
                      .reduce((sum, r) => sum + (r.paidAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Balance</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹
                    {results
                      .reduce((sum, r) => sum + (r.balanceAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No payment records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Lab Code
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Patient Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Total Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Paid Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Balance
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Payment Method
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((reg) => (
                        <tr
                          key={reg._id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              {reg.labCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-900 font-medium">
                            {reg.patient?.name || "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">
                            ₹{reg.totalAmount?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-green-600 font-semibold">
                            ₹{reg.paidAmount?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {reg.balanceAmount > 0 ? (
                              <span className="text-orange-600 font-semibold">
                                ₹{reg.balanceAmount?.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-green-600 font-semibold">
                                Paid
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {reg.paymentMethod || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-sm">
                            {new Date(reg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {reg.balanceAmount > 0 ? (
                              <button
                                onClick={() => {
                                  setShowPaymentHistory(false);
                                  handleCollectPayment(reg);
                                }}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                              >
                                Collect
                              </button>
                            ) : (
                              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                <CheckCircle size={16} />
                                Paid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && registrationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Delete Registration</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRegistrationToDelete(null);
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
                  You are about to delete registration{" "}
                  <span className="font-bold">
                    {registrationToDelete.labCode}
                  </span>{" "}
                  for{" "}
                  <span className="font-bold">
                    {registrationToDelete.patient?.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 mb-2">
                  Registration Details:
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-slate-600">Lab Code:</span>{" "}
                    <span className="font-semibold">
                      {registrationToDelete.labCode}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Patient:</span>{" "}
                    <span className="font-semibold">
                      {registrationToDelete.patient?.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Amount:</span>{" "}
                    <span className="font-semibold">
                      ₹{registrationToDelete.totalAmount?.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Status:</span>{" "}
                    <span className="font-semibold">
                      {registrationToDelete.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRegistrationToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
