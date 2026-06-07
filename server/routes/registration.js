const express = require("express");
const Registration = require("../models/Registration");
const Patient = require("../models/Patient");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get registrations with filters (MUST be before /:id route)
router.get("/search", authMiddleware(["staff", "admin"]), async (req, res) => {
  try {
    const { patientName, labCode, fromDate, toDate, status } = req.query;
    const filter = {};

    if (labCode) filter.labCode = { $regex: labCode, $options: "i" };
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        // Start of the day
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = startDate;
      }
      if (toDate) {
        // End of the day
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    let registrations = await Registration.find(filter)
      .populate("patient")
      .sort({ createdAt: -1 });

    // Filter by patient name after population
    if (patientName) {
      registrations = registrations.filter((reg) =>
        reg.patient?.name?.toLowerCase().includes(patientName.toLowerCase()),
      );
    }

    console.log("Search endpoint called with filters:", {
      patientName,
      labCode,
      fromDate,
      toDate,
      status,
    });
    console.log("Found registrations:", registrations.length);
    res.json(registrations);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create registration
router.post("/", authMiddleware(["staff", "admin"]), async (req, res) => {
  try {
    const {
      patient,
      tests,
      paymentMethod,
      totalAmount,
      discountTest,
      discountRegn,
      discountReason,
      discountAuthorization,
      netAmount,
      paidAmount,
      status,
      comment,
      trf,
    } = req.body;

    const registration = new Registration({
      labCode: `LAB${Date.now()}`,
      patient,
      tests,
      paymentMethod,
      totalAmount,
      discountTest,
      discountRegn,
      discountReason,
      discountAuthorization,
      netAmount,
      paidAmount,
      balanceAmount: netAmount - paidAmount,
      status: status || "Registration",
      comment,
      trf,
    });

    await registration.save();
    await registration.populate("patient");

    // Emit real-time update to reports
    if (req.io) {
      req.io.to("reports").emit("registration-created", {
        registration: registration,
        date: new Date().toISOString().split("T")[0],
      });

      // Also emit to registrations room
      req.io.to("registrations").emit("registration-created", {
        registration: registration,
        timestamp: new Date(),
      });
    }

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single registration
router.get("/:id", authMiddleware(["staff", "admin"]), async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate(
      "patient",
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update registration
router.put("/:id", authMiddleware(["staff", "admin"]), async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    ).populate("patient");

    // Emit real-time update to reports
    if (req.io) {
      req.io.to("reports").emit("registration-updated", {
        registration: registration,
        date: new Date().toISOString().split("T")[0],
      });

      // Also emit to registrations room
      req.io.to("registrations").emit("registration-updated", {
        registration: registration,
        timestamp: new Date(),
      });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete registration (admin only)
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await Registration.findByIdAndDelete(req.params.id);

    // Emit real-time update
    if (req.io) {
      req.io.to("registrations").emit("registration-deleted", {
        registrationId: req.params.id,
        timestamp: new Date(),
      });
    }

    res.json({ message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
