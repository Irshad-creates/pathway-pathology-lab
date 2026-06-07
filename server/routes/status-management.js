const express = require("express");
const Registration = require("../models/Registration");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Update registration status with workflow validation
router.put(
  "/update-status/:id",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { status, technician, notes, results } = req.body;
      const registration = await Registration.findById(req.params.id);

      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      // Validate status transitions (real workflow rules)
      const validTransitions = {
        Registration: ["Sample Pending", "Sample Collected"], // Can skip to collected if immediate
        "Sample Pending": ["Sample Collected"],
        "Sample Collected": ["Processing"],
        Processing: ["Report Ready"],
        "Report Ready": ["Printed"],
        Printed: ["Completed"],
      };

      const currentStatus = registration.status;
      if (!validTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${currentStatus} to ${status}`,
        });
      }

      // Update status and timestamps
      registration.status = status;

      switch (status) {
        case "Sample Pending":
          // Payment confirmed, ready for sample collection
          break;
        case "Sample Collected":
          registration.sampleCollectedAt = new Date();
          break;
        case "Processing":
          registration.processingStartedAt = new Date();
          if (technician) registration.technician = technician;
          break;
        case "Report Ready":
          registration.reportReadyAt = new Date();
          // Save test results if provided
          if (results) {
            registration.results = results;
          }
          break;
        case "Printed":
          registration.printedAt = new Date();
          break;
        case "Completed":
          registration.completedAt = new Date();
          break;
      }

      if (notes) {
        registration.comment = notes;
      }

      await registration.save();
      await registration.populate("patient");

      // Emit real-time update
      if (req.io) {
        req.io.to("registrations").emit("status-updated", {
          registration,
          oldStatus: currentStatus,
          newStatus: status,
          timestamp: new Date(),
        });
      }

      res.json(registration);
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Get registrations by status for lab workflow
router.get(
  "/by-status/:status",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.params;
      const registrations = await Registration.find({ status })
        .populate("patient")
        .sort({ createdAt: -1 });

      // Don't populate tests.test to preserve referenceRange and unit
      // The test details are already stored in the registration

      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Get workflow statistics
router.get(
  "/workflow-stats",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const stats = await Registration.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

      // Calculate average processing times
      const processingTimes = await Registration.aggregate([
        {
          $match: {
            sampleCollectedAt: { $exists: true },
            reportReadyAt: { $exists: true },
          },
        },
        {
          $project: {
            processingTime: {
              $divide: [
                { $subtract: ["$reportReadyAt", "$sampleCollectedAt"] },
                1000 * 60 * 60, // Convert to hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgProcessingTime: { $avg: "$processingTime" },
            minProcessingTime: { $min: "$processingTime" },
            maxProcessingTime: { $max: "$processingTime" },
          },
        },
      ]);

      res.json({
        statusCounts: stats,
        processingTimes: processingTimes[0] || null,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Bulk status update for lab efficiency
router.put(
  "/bulk-update",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { registrationIds, status, technician } = req.body;

      const updateData = { status };

      switch (status) {
        case "Sample Collected":
          updateData.sampleCollectedAt = new Date();
          break;
        case "Processing":
          updateData.processingStartedAt = new Date();
          if (technician) updateData.technician = technician;
          break;
        case "Report Ready":
          updateData.reportReadyAt = new Date();
          break;
        case "Printed":
          updateData.printedAt = new Date();
          break;
        case "Completed":
          updateData.completedAt = new Date();
          break;
      }

      const result = await Registration.updateMany(
        { _id: { $in: registrationIds } },
        updateData,
      );

      // Emit real-time updates
      if (req.io) {
        req.io.to("registrations").emit("bulk-status-updated", {
          count: result.modifiedCount,
          status,
          timestamp: new Date(),
        });
      }

      res.json({
        message: `Updated ${result.modifiedCount} registrations to ${status}`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
