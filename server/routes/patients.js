const express = require("express");
const Patient = require("../models/Patient");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Create patient
router.post("/", authMiddleware(["staff", "admin"]), async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();

    // Emit real-time update
    if (req.io) {
      req.io.to("patients").emit("patient-created", {
        patient: patient,
        timestamp: new Date(),
      });
    }

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search patients
router.get("/search", async (req, res) => {
  try {
    const { name, mobile, labCode } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (mobile) filter.mobile = mobile;
    if (labCode) filter.labCode = labCode;

    const patients = await Patient.find(filter);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient suggestions for autocomplete
router.get("/suggestions", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Search by name or mobile number
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { mobile: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .select(
        "name mobile age gender dob email address city patientType doctorName collectionCenter affiliation isRegistered",
      );

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update patient
router.put("/:id", authMiddleware(["staff", "admin"]), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Emit real-time update
    if (req.io) {
      req.io.to("patients").emit("patient-updated", {
        patient: patient,
        timestamp: new Date(),
      });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
