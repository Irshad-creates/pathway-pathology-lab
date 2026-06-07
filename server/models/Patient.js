const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientType: { type: String, enum: ["OPD", "IPD", "CASHLESS", "WALKIN"] },
    patientId: String,
    title: String,
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "None"] },
    age: Number,
    ageUnit: { type: String, default: "Yr" },
    dob: Date,
    mobile: { type: String, required: true },
    email: String,
    address: String,
    city: String,
    doctorName: String,
    barcode: String,
    sendResultSMS: { type: Boolean, default: false },
    labCode: String,
    registrationDate: { type: Date, default: Date.now },
    collectionDate: Date,
    collectionCenter: String,
    affiliation: String,
    referredDoctor: String,
    isRegistered: { type: Boolean, default: false },
    homeCollection: { type: Boolean, default: false },
    sampleCollectedAt: String,
    collectionRoundBoy: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", patientSchema);
