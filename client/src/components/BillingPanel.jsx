import { useState, useEffect } from "react";
import { Tag, CreditCard } from "lucide-react";

export default function BillingPanel({ tests, onBillingChange }) {
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("amount");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [authorization, setAuthorization] = useState("");

  const totalAmount = tests.reduce((sum, t) => sum + (t.price || 0), 0);
  const discountValue = parseFloat(discount) || 0;
  const paidValue = parseFloat(paidAmount) || 0;
  const discountAmount =
    discountType === "amount"
      ? discountValue
      : (totalAmount * discountValue) / 100;
  const netAmount = totalAmount - discountAmount;
  const balanceAmount = netAmount - paidValue;
  const refundAmount = paidValue > netAmount ? paidValue - netAmount : 0;

  useEffect(() => {
    onBillingChange({
      totalAmount,
      discountAmount,
      netAmount,
      paidAmount: paidValue,
      balanceAmount,
      refundAmount,
      paymentMethod,
      discountReason,
      authorization,
    });
  }, [
    discount,
    discountType,
    paidAmount,
    paymentMethod,
    discountReason,
    authorization,
    tests,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discount Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Tag size={20} className="text-amber-600" />
            Discount
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="amount">Amount (₹)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason
              </label>
              <select
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select Reason</option>
                <option value="DR REFERENCE">DR REFERENCE</option>
                <option value="STAFF RELATIVE">STAFF RELATIVE</option>
                <option value="HOSPITAL STAFF">HOSPITAL STAFF</option>
                <option value="LAB STAFF">LAB STAFF</option>
                <option value="CHARITABLE">CHARITABLE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Authorization
              </label>
              <select
                value={authorization}
                onChange={(e) => setAuthorization(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select Authorized By</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Payment Method
          </h3>
          <div className="space-y-3">
            
            {["Cash", "UPI", "Send to WhatsApp (Pending)"].map((method) => (
              <label
                key={method}
                className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">
                  {method}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center text-indigo-600 font-bold text-lg">
              ₹
            </div>
            Amount Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total:</span>
              <span className="font-bold text-slate-900">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Discount:</span>
              <span className="font-bold text-amber-600">
                -₹{discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Net Amount:</span>
              <span className="font-bold text-lg text-indigo-600">
                ₹{netAmount.toFixed(2)}
              </span>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paid Amount
                {paymentMethod === "Cash" && (
                  <span className="text-red-600 ml-1">*</span>
                )}
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder={
                  paymentMethod === "Cash" ? "Required for Cash" : "0"
                }
                required={paymentMethod === "Cash"}
              />
              {paymentMethod === "Cash" && !paidAmount && (
                <p className="text-red-600 text-xs mt-1">
                  Required for Cash payment
                </p>
              )}
            </div>
            <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
              <span className="text-slate-600">Balance:</span>
              <span className="font-bold text-slate-900">
                ₹{balanceAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Refund:</span>
              <span className="font-bold text-green-600">
                ₹{refundAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
