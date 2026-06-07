import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { MessageCircle, Smartphone, CreditCard } from "lucide-react";
import { settingsAPI } from "../services/api";

export default function QRPayment({
  netAmount,
  balanceAmount,
  patientName,
  tests,
  mobile,
  paymentMethod,
  registrationId,
  onPaymentComplete,
}) {
  const qrRef = useRef();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setSettings(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Calculate the correct amount to show in QR
  // Only show the actual balance amount, never fallback to netAmount when balance is 0
  const qrAmount = Math.max(0, balanceAmount);

  // Only show QR if there's actually an amount to pay
  const shouldShowQR = qrAmount > 0;

  const upiString = settings
    ? `upi://pay?pa=${settings.upiId}&am=${qrAmount}&tn=${encodeURIComponent(settings.labName)}`
    : `upi://pay?pa=9004934515@upi&am=${qrAmount}&tn=Pathway%20Pathology%20Lab`;

  useEffect(() => {
    if (qrRef.current && shouldShowQR && paymentMethod === "UPI") {
      qrRef.current.innerHTML = "";
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
    } else if (qrRef.current) {
      // Clear QR code if no amount to pay
      qrRef.current.innerHTML = "";
    }
  }, [qrAmount, paymentMethod, upiString, shouldShowQR]);

  const testNames = tests.map((t) => t.shortName || t.name).join(", ");
  const labName = settings?.labName || "Pathway Pathology Lab";
  const reportTime = settings?.reportGenerationTime || "tomorrow";

  // Use appropriate amount for WhatsApp message - only show balance if there's actually a balance
  const messageAmount = Math.max(0, balanceAmount);
  const paymentText =
    messageAmount > 0
      ? `remaining balance is ₹${messageAmount.toFixed(2)}`
      : `payment is complete. Total paid: ₹${(netAmount - balanceAmount).toFixed(2)}`;

  const whatsappMessage = `${labName}\nHey ${patientName},\nYour tests is being registered,\nTests are: ${testNames}\nYour ${paymentText}\nTest results will be generated ${reportTime}.\nThank you.`;
  const whatsappLink = `https://wa.me/91${mobile?.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  // Only show QR for UPI payment and when there's an amount to pay
  if (paymentMethod !== "UPI") {
    return null;
  }

  // If no amount to pay, show payment complete message
  if (!shouldShowQR) {
    return (
      <div className="border border-green-300 bg-green-50 p-4 rounded mt-4">
        <div className="text-center">
          <div className="text-green-600 mb-2">
            <CreditCard size={48} className="mx-auto" />
          </div>
          <h3 className="font-semibold text-green-800 mb-2">
            Payment Complete!
          </h3>
          <p className="text-sm text-green-700">
            {balanceAmount < 0
              ? `Overpaid by ₹${Math.abs(balanceAmount).toFixed(2)}. Refund due.`
              : "No remaining balance. Ready to proceed with registration."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 p-4 rounded mt-4">
      <div className="grid grid-cols-2 gap-4">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <h3 className="font-semibold mb-3">Scan for Payment</h3>
          <div ref={qrRef} className="mb-2"></div>
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600 mb-1">
              Amount: ₹{qrAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">
              UPI: {settings?.upiId || "9004934515@upi"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Scan with any UPI app to pay
            </p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="font-semibold mb-3">Send via WhatsApp</h3>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
          >
            <MessageCircle size={20} />
            Send Message
          </a>

          {/* Alternative Payment Options */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mt-1">
              Complete payment to proceed with registration
            </p>
          </div>
        </div>
      </div>

      {/* Payment Security Info */}
      <div className="mt-4 bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <CreditCard size={16} />
          <span className="font-semibold">Payment Instructions:</span>
        </div>
        <ul className="text-xs text-blue-700 mt-1 space-y-1">
          <li>• Scan QR code with any UPI app</li>
          <li>• Complete payment in your UPI app</li>
          <li>• Click "Save Registration" after payment</li>
          <li>• Payment verification will be handled automatically</li>
        </ul>
      </div>
    </div>
  );
}
