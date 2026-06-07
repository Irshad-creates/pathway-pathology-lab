const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    labName: { type: String, default: "Pathway Pathology Lab" },
    upiId: { type: String, default: "9004934515@upi" },
    phoneNumber: { type: String, default: "+91 90049 34515" },
    email: { type: String, default: "info@pathwaylab.com" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    reportGenerationTime: { type: String, default: "tomorrow" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
