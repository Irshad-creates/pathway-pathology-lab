import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Smartphone,
  CreditCard,
  Wallet,
  Hand,
  AlertCircle,
} from "lucide-react";
import { registrationAPI } from "../services/api";

export default function UPIPaymentVerification({
  registrationId,
  amount,
  onPaymentSuccess,
  onPaymentFailed,
  onClose,
}) {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [paymentLink, setPaymentLink] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [manualVerification, setManualVerification] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [countdown, setCountdown] = useState(120); // 2 minutes timer
  const qrRef = useRef();

  // Available payment gateways
  const paymentGateways = [
    {
      id: "razorpay",
      name: "Razorpay",
      icon: CreditCard,
      description: "All UPI apps supported",
    },
    {
      id: "phonepe",
      name: "PhonePe",
      icon: Smartphone,
      description: "PhonePe Business",
    },
    { id: "paytm", name: "Paytm", icon: Wallet, description: "Paytm Business" },
    {
      id: "manual",
      name: "Manual Verification",
      icon: Hand,
      description: "Admin verification",
    },
  ];

  useEffect(() => {
    // Generate QR code when payment status becomes pending - EXACT SAME AS QRPayment
    if (paymentStatus === "pending" && qrRef.current) {
      qrRef.current.innerHTML = "";
      const upiString = `upi://pay?pa=9004934515@upi&am=${amount}&tn=PathwayLab`;

      const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        data: upiString,
        dotsOptions: {
          color: "#000000",
          type: "square",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
      });
      qrCode.append(qrRef.current);
    }
  }, [paymentStatus, amount]);

  useEffect(() => {
    // Start countdown when payment is pending
    if (paymentStatus === "pending" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === "pending" && countdown === 0) {
      simulatePaymentVerification();
    }
  }, [paymentStatus, countdown]);

  useEffect(() => {
    // Start polling for payment status every 5 seconds
    if (paymentLink && paymentStatus === "pending") {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000);
      setPollingInterval(interval);

      return () => clearInterval(interval);
    }
  }, [paymentLink, paymentStatus]);

  const generatePaymentLink = async () => {
    setLoading(true);
    try {
      // Simulate payment link generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPaymentStatus("pending");

      // Start simulated payment verification after 2 minutes
      setTimeout(() => {
        simulatePaymentVerification();
      }, 120000); // 2 minutes
    } catch (error) {
      alert("Failed to generate payment link: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentVerification = () => {
    // In a real system, this would check actual payment status from payment gateway
    // For now, we'll make it require manual verification only
    setPaymentStatus("verification_required");
    setManualVerification(true);

    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };

  const checkPaymentStatus = async () => {
    if (!registrationId) {
      // If no registration ID, we can't check status yet
      return;
    }

    try {
      const response = await fetch(
        `/api/upi-payments/payment-status/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.paymentDetails?.status === "completed") {
        setPaymentStatus("completed");
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        onPaymentSuccess(data);
      } else if (data.paymentDetails?.status === "failed") {
        setPaymentStatus("failed");
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        onPaymentFailed(data);
      }
    } catch (error) {}
  };

  const handleManualVerification = async () => {
    if (!transactionId.trim()) {
      alert("Please enter transaction ID");
      return;
    }

    setLoading(true);
    try {
      const verificationData = {
        registrationId: registrationId || `temp_${Date.now()}`,
        transactionId: transactionId.trim(),
        amount,
        gateway: "manual",
      };

      const response = await fetch("/api/upi-payments/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus("completed");
        // For manual verification, create a payment data object
        const paymentData = {
          method: "UPI",
          amount: amount,
          transactionId: transactionId.trim(),
          verified: true,
          paidAmount: amount,
          paymentDetails: {
            transactionId: transactionId.trim(),
            status: "completed",
            gateway: "manual",
          },
        };
        onPaymentSuccess(paymentData);
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (error) {
      alert("Verification failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "completed":
        return <CheckCircle className="text-green-500" size={48} />;
      case "failed":
        return <XCircle className="text-red-500" size={48} />;
      case "pending":
        return <Clock className="text-yellow-500 animate-pulse" size={48} />;
      case "verification_required":
        return <CreditCard className="text-blue-500" size={48} />;
      default:
        return <QrCode className="text-blue-500" size={48} />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "completed":
        return "Payment completed successfully!";
      case "failed":
        return "Payment failed. Please try again.";
      case "pending":
        return "Waiting for payment confirmation...";
      case "verification_required":
        return "Payment verification required";
      default:
        return "Select payment method to proceed";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">UPI Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Payment Amount */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            ₹{amount.toFixed(2)}
          </div>
          <p className="text-gray-600">Amount to be paid</p>
        </div>

        {/* Payment Status */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-2">{getStatusIcon()}</div>
          <p className="text-lg font-semibold text-center">
            {getStatusMessage()}
          </p>
        </div>

        {paymentStatus === "initial" && (
          <>
            {/* Payment Gateway Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Payment Gateway
              </label>
              <div className="space-y-2">
                {paymentGateways.map((gateway) => {
                  const IconComponent = gateway.icon;
                  return (
                    <label
                      key={gateway.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === gateway.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={gateway.id}
                        checked={paymentMethod === gateway.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <IconComponent size={24} className="mr-3 text-blue-600" />
                      <div>
                        <div className="font-semibold">{gateway.name}</div>
                        <div className="text-sm text-gray-600">
                          {gateway.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Generate Payment Button */}
            <button
              onClick={() => {
                if (paymentMethod === "manual") {
                  setManualVerification(true);
                } else {
                  generatePaymentLink();
                }
              }}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  {paymentMethod === "manual" ? (
                    <>
                      <CreditCard className="mr-2" size={20} />
                      Manual Verification
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2" size={20} />
                      Generate Payment Link
                    </>
                  )}
                </>
              )}
            </button>
          </>
        )}

        {/* QR Code and Payment Instructions */}
        {paymentStatus === "pending" && !manualVerification && (
          <div className="mb-6">
            {/* QR Code Display */}
            <div className="text-center mb-4">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <div
                  ref={qrRef}
                  className="w-48 h-48 bg-white flex items-center justify-center rounded"
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Scan with any UPI app to pay ₹{amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                UPI ID: 9004934515@upi
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                Payment Instructions:
              </h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Open any UPI app (PhonePe, Paytm, GPay, etc.)</li>
                <li>Scan the QR code above</li>
                <li>Verify amount: ₹{amount.toFixed(2)}</li>
                <li>Complete payment using your UPI PIN</li>
                <li>Enter transaction ID below for verification</li>
              </ol>
            </div>

            {/* Payment Timer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">
                  Waiting for payment completion...
                </span>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  <span className="text-sm text-yellow-700">
                    {countdown > 0
                      ? `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")}`
                      : "Time up!"}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((120 - countdown) / 120) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                Complete your payment and enter transaction ID below when ready
              </p>
            </div>

            {/* Testing/Demo Buttons */}
          </div>
        )}

        {/* Payment verification required message */}
        {paymentStatus === "verification_required" && !manualVerification && (
          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">
                    Payment Verification Required
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Automatic verification completed. Please verify your payment
                    manually by entering your transaction ID.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManualVerification(true)}
                className="mt-3 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
              >
                Verify Payment Manually
              </button>
            </div>
          </div>
        )}
        {manualVerification && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                Manual Verification
              </h4>
              <p className="text-sm text-blue-700">
                If you've completed the payment but automatic verification
                failed, enter your transaction details below.
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID / UTR Number *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter 12-digit UTR number (e.g., 123456789012)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Find this in your UPI app under transaction history or payment
              confirmation
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleManualVerification}
                disabled={loading || !transactionId.trim()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Payment"}
              </button>
              <button
                onClick={() => setManualVerification(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Back to Auto-Verify
              </button>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        {qrCode && paymentStatus === "pending" && (
          <div className="text-center mb-6">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                <QrCode size={120} className="text-gray-400" />
                <div className="absolute text-xs text-gray-600 mt-32">
                  QR Code for UPI Payment
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scan with any UPI app to pay ₹{amount}
            </p>
          </div>
        )}

        {/* Payment Instructions */}
        {paymentLink && paymentStatus === "pending" && (
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Payment Instructions:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click the payment link or scan QR code</li>
                <li>• Complete payment in your UPI app</li>
                <li>• Wait for automatic verification</li>
                <li>• Or enter transaction ID for manual verification</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {paymentStatus === "pending" && (
            <button
              onClick={checkPaymentStatus}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="inline mr-2" size={16} />
              Check Status
            </button>
          )}

          {(paymentStatus === "pending" ||
            paymentStatus === "verification_required") &&
            !manualVerification && (
              <button
                onClick={() => setManualVerification(true)}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
              >
                Manual Verify
              </button>
            )}

          {(paymentStatus === "completed" || paymentStatus === "failed") && (
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          )}
        </div>

        {/* Real-time Status Updates */}
        {paymentStatus === "pending" && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-sm text-gray-600">
              <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Checking payment status automatically...
            </div>
          </div>
        )}

        {paymentStatus === "verification_required" && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-sm text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Manual verification required to complete registration
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
