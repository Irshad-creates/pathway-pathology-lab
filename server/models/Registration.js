const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    labCode: { type: String, required: true },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    tests: [
      {
        test: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
        testName: String,
        price: Number,
        referenceRange: String, // e.g., "4.5-11.0 x10^9/L"
        unit: String, // e.g., "x10^9/L"
        discountAmt: { type: Number, default: 0 },
        discountPct: { type: Number, default: 0 },
        refund: { type: Number, default: 0 },
      },
    ],
    totalAmount: Number,
    discountTest: { type: Number, default: 0 },
    discountRegn: { type: Number, default: 0 },
    discountReason: String,
    discountAuthorization: String,
    netAmount: Number,
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Send to WhatsApp (Pending)"],
    },
    billReceiptNo: String,
    paidAmount: { type: Number, default: 0 },
    balanceAmount: Number,
    refundAmount: { type: Number, default: 0 },
    recoveryAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "Registration", // Just registered, payment pending/done
        "Sample Pending", // Payment done, waiting for sample collection
        "Sample Collected", // Sample taken, sent to lab
        "Processing", // Lab technician analyzing samples
        "Report Ready", // Results ready, can be printed
        "Printed", // Report printed, ready for pickup
        "Completed", // Patient received report
      ],
      default: "Registration",
    },
    sampleCollectedAt: { type: Date },
    processingStartedAt: { type: Date },
    reportReadyAt: { type: Date },
    printedAt: { type: Date },
    completedAt: { type: Date },
    technician: { type: String }, // Who processed the samples
    results: { type: mongoose.Schema.Types.Mixed }, // Test results object
    reportUrl: { type: String }, // PDF report link
    trf: String,
    comment: String,
    isUrgent: { type: Boolean, default: false }, // Mark registration as urgent
  },
  { timestamps: true },
);

module.exports = mongoose.model("Registration", registrationSchema);
