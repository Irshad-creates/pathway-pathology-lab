import {
  X,
  Printer,
  DollarSign,
  Calendar,
  User,
  Phone,
  MapPin,
} from "lucide-react";

export default function RegistrationDetails({
  registration,
  onClose,
  onPrint,
  onPayment,
}) {
  if (!registration) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Registration Details</h2>
            <p className="text-blue-100 mt-1">
              Lab Code: {registration.labCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Patient Name</p>
                <p className="text-lg font-semibold text-slate-900">
                  {registration.patient?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Age</p>
                <p className="text-lg font-semibold text-slate-900">
                  {registration.patient?.age} {registration.patient?.ageUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Gender</p>
                <p className="text-lg font-semibold text-slate-900">
                  {registration.patient?.gender || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Patient Type</p>
                <p className="text-lg font-semibold text-slate-900">
                  {registration.patient?.patientType || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Phone size={16} />
                  Mobile Number
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {registration.patient?.mobile || "-"}
                </p>
              </div>
              {registration.patient?.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <MapPin size={16} />
                    Address
                  </p>
                  <p className="text-slate-900">
                    {registration.patient.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Information */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-green-600" />
              Registration Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Lab Code</p>
                <p className="text-lg font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full inline-block">
                  {registration.labCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Registration Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(registration.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-semibold">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      registration.status === "Registration"
                        ? "bg-blue-100 text-blue-800"
                        : registration.status === "Sample Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : registration.status === "Sample Collected"
                            ? "bg-orange-100 text-orange-800"
                            : registration.status === "Processing"
                              ? "bg-purple-100 text-purple-800"
                              : registration.status === "Report Ready"
                                ? "bg-green-100 text-green-800"
                                : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {registration.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Payment Method</p>
                <p className="text-lg font-semibold text-slate-900">
                  {registration.paymentMethod || "Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* Tests Information */}
          {registration.tests && registration.tests.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Tests</h3>
              <div className="space-y-2">
                {registration.tests.map((test, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200"
                  >
                    <span className="text-slate-900 font-medium">
                      {test.testName}
                    </span>
                    <span className="text-slate-600">₹{test.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-purple-600" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{registration.totalAmount?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">Net Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{registration.netAmount?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{registration.paidAmount?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">Balance Amount</p>
                <p
                  className={`text-2xl font-bold ${registration.balanceAmount > 0 ? "text-orange-600" : "text-green-600"}`}
                >
                  ₹{registration.balanceAmount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onPrint}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Print
            </button>
            {registration.balanceAmount > 0 && (
              <button
                onClick={onPayment}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
              >
                <DollarSign size={18} />
                Collect Payment
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
