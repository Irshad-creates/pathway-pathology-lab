import { useState } from "react";
import {
  Calendar,
  DollarSign,
  FileText,
  Download,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { reportsAPI } from "../services/api";

export default function AdminReports() {
  const [reportType, setReportType] = useState("daily");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportFromDate, setReportFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [reportToDate, setReportToDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadReports = async () => {
    if (reportType === "daily") {
      await loadDailyReport();
    } else if (reportType === "range") {
      await loadDateRangeReport();
    } else if (reportType === "payment") {
      await loadPaymentSummary();
    }
  };

  const loadDailyReport = async () => {
    setReportLoading(true);
    try {
      const res = await reportsAPI.getDailySummary(reportDate);
      setReportData(res.data);
    } catch (error) {
      console.error("Error loading daily report:", error);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  const loadDateRangeReport = async () => {
    setReportLoading(true);
    try {
      const res = await reportsAPI.getDateRange(reportFromDate, reportToDate);
      setReportData(res.data);
    } catch (error) {
      console.error("Error loading date range report:", error);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  const loadPaymentSummary = async () => {
    setReportLoading(true);
    try {
      const res = await reportsAPI.getPaymentSummary(
        reportFromDate,
        reportToDate,
      );
      setReportData(res.data);
    } catch (error) {
      console.error("Error loading payment summary:", error);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">
          Generate and analyze business reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label
            className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: reportType === "daily" ? "#2563eb" : "#e2e8f0",
              backgroundColor: reportType === "daily" ? "#eff6ff" : "#f8fafc",
            }}
          >
            <input
              type="radio"
              value="daily"
              checked={reportType === "daily"}
              onChange={(e) => setReportType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-semibold text-slate-900">Daily Summary</p>
              <p className="text-sm text-slate-600">Single day report</p>
            </div>
          </label>
          <label
            className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: reportType === "range" ? "#2563eb" : "#e2e8f0",
              backgroundColor: reportType === "range" ? "#eff6ff" : "#f8fafc",
            }}
          >
            <input
              type="radio"
              value="range"
              checked={reportType === "range"}
              onChange={(e) => setReportType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-semibold text-slate-900">Date Range</p>
              <p className="text-sm text-slate-600">Multiple days report</p>
            </div>
          </label>
          <label
            className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: reportType === "payment" ? "#2563eb" : "#e2e8f0",
              backgroundColor: reportType === "payment" ? "#eff6ff" : "#f8fafc",
            }}
          >
            <input
              type="radio"
              value="payment"
              checked={reportType === "payment"}
              onChange={(e) => setReportType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-semibold text-slate-900">Payment Summary</p>
              <p className="text-sm text-slate-600">Payment breakdown</p>
            </div>
          </label>
        </div>

        {/* Date Selection */}
        <div className="flex flex-wrap gap-4 items-end">
          {reportType === "daily" && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {(reportType === "range" || reportType === "payment") && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={reportFromDate}
                  onChange={(e) => setReportFromDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={reportToDate}
                  onChange={(e) => setReportToDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            onClick={loadReports}
            disabled={reportLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
          >
            {reportLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report Display */}
      {reportLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600">Generating report...</p>
          </div>
        </div>
      )}

      {!reportLoading && reportData && (
        <div className="space-y-6">
          {/* Daily Summary Report */}
          {reportType === "daily" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-blue-600" />
                  Daily Summary - {reportData.date}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      Total Registrations
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {reportData.totalRegistrations}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium">
                      Total Amount
                    </p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      ₹{reportData.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium">
                      Cash Payments
                    </p>
                    <p className="text-3xl font-bold text-yellow-900 mt-2">
                      ₹{reportData.cashAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium">
                      UPI Payments
                    </p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      ₹{reportData.upiAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {reportData.registrations &&
                reportData.registrations.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                    <h4 className="font-bold text-slate-900 mb-4">
                      Registration Details
                    </h4>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Lab Code
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Patient
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Payment
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.registrations.map((reg) => (
                          <tr
                            key={reg._id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-3 px-4 text-slate-900">
                              {reg.labCode}
                            </td>
                            <td className="py-3 px-4 text-slate-900">
                              {reg.patient?.name}
                            </td>
                            <td className="py-3 px-4 text-slate-900 font-semibold">
                              ₹{reg.totalAmount}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${reg.paymentMethod === "Cash" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}
                              >
                                {reg.paymentMethod?.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${reg.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                              >
                                {reg.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* Date Range Report */}
          {reportType === "range" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-blue-600" />
                  Date Range Report - {reportData.fromDate} to{" "}
                  {reportData.toDate}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      Total Registrations
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {reportData.totalSummary?.totalRegistrations || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium">
                      Total Amount
                    </p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      ₹
                      {reportData.totalSummary?.totalAmount?.toLocaleString() ||
                        0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium">
                      Cash Payments
                    </p>
                    <p className="text-3xl font-bold text-yellow-900 mt-2">
                      ₹
                      {reportData.totalSummary?.cashAmount?.toLocaleString() ||
                        0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium">
                      UPI Payments
                    </p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      ₹
                      {reportData.totalSummary?.upiAmount?.toLocaleString() ||
                        0}
                    </p>
                  </div>
                </div>
              </div>

              {reportData.dailyReports &&
                reportData.dailyReports.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                    <h4 className="font-bold text-slate-900 mb-4">
                      Daily Breakdown
                    </h4>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Registrations
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Total Amount
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Cash
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            UPI
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.dailyReports.map((day) => (
                          <tr
                            key={day.date}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-3 px-4 text-slate-900 font-medium">
                              {day.date}
                            </td>
                            <td className="py-3 px-4 text-slate-900">
                              {day.registrations}
                            </td>
                            <td className="py-3 px-4 text-slate-900 font-semibold">
                              ₹{day.totalAmount?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-900">
                              ₹{day.cashAmount?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-900">
                              ₹{day.upiAmount?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-900">
                              ₹{day.balanceAmount?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* Payment Summary Report */}
          {reportType === "payment" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard size={24} className="text-blue-600" />
                  Payment Method Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Cash Payments
                    </h4>
                    <p className="text-3xl font-bold text-yellow-600">
                      ₹{reportData.cash?.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      {reportData.cash?.count || 0} transactions
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      UPI Payments
                    </h4>
                    <p className="text-3xl font-bold text-purple-600">
                      ₹{reportData.upi?.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-purple-700 mt-2">
                      {reportData.upi?.count || 0} transactions
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Total</h4>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{reportData.total?.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      {reportData.total?.count || 0} transactions
                    </p>
                  </div>
                </div>

                {reportData.cash?.amount > 0 || reportData.upi?.amount > 0 ? (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4">
                      Payment Distribution
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Cash
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {(
                              (reportData.cash?.amount /
                                reportData.total?.amount) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-yellow-500 h-full"
                            style={{
                              width: `${(reportData.cash?.amount / reportData.total?.amount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            UPI
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {(
                              (reportData.upi?.amount /
                                reportData.total?.amount) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full"
                            style={{
                              width: `${(reportData.upi?.amount / reportData.total?.amount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {!reportLoading && !reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex justify-center items-center">
          <div className="text-center">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">
              Select report type and click "Generate Report" to view data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
