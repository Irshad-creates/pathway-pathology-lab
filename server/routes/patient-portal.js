const express = require("express");
const Registration = require("../models/Registration");
const Patient = require("../models/Patient");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get patient's own registrations and test history
router.get("/my-tests", authMiddleware(["patient"]), async (req, res) => {
  try {
    // Find patient by user's mobile number (username)
    const patient = await Patient.findOne({ mobile: req.user.username });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // Get all registrations for this patient
    // Don't populate tests.test to preserve referenceRange and unit fields
    const registrations = await Registration.find({
      patient: patient._id,
    }).sort({ createdAt: -1 });

    res.json({
      patient,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific registration details
router.get(
  "/registration/:id",
  authMiddleware(["patient"]),
  async (req, res) => {
    try {
      // Find patient by user's mobile number
      const patient = await Patient.findOne({ mobile: req.user.username });
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      // Get registration and verify it belongs to this patient
      // Don't populate tests.test to preserve referenceRange and unit fields
      const registration = await Registration.findOne({
        _id: req.params.id,
        patient: patient._id,
      }).populate("patient");

      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Update patient profile
router.put("/profile", authMiddleware(["patient"]), async (req, res) => {
  try {
    // Find patient by user's mobile number
    const patient = await Patient.findOne({ mobile: req.user.username });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // Update allowed fields only
    const allowedFields = ["email", "address", "city", "age"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedPatient = await Patient.findByIdAndUpdate(
      patient._id,
      updateData,
      { new: true },
    );

    res.json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get lab status (open/closed)
router.get("/lab-status", async (req, res) => {
  try {
    // Simple logic: lab is open 8 AM to 8 PM
    const now = new Date();
    const hour = now.getHours();
    const isOpen = hour >= 8 && hour < 20;

    res.json({
      isOpen,
      message: isOpen ? "Lab is currently open" : "Lab is currently closed",
      hours: "8:00 AM - 8:00 PM",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
