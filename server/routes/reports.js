const express = require("express");
const Registration = require("../models/Registration");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get daily summary report
router.get(
  "/daily-summary",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();

      // Set date range for the day
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);

      const registrations = await Registration.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("patient tests.test");

      // Calculate summary
      const summary = {
        date: targetDate.toISOString().split("T")[0],
        totalRegistrations: registrations.length,
        totalAmount: 0,
        cashAmount: 0,
        upiAmount: 0,
        paidAmount: 0,
        balanceAmount: 0,
        registrations: registrations,
      };

      registrations.forEach((reg) => {
        summary.totalAmount += reg.totalAmount || 0;
        summary.paidAmount += reg.paidAmount || 0;
        summary.balanceAmount += reg.balanceAmount || 0;

        if (reg.paymentMethod === "Cash") {
          summary.cashAmount += reg.paidAmount || 0;
        } else if (reg.paymentMethod === "UPI") {
          summary.upiAmount += reg.paidAmount || 0;
        }
      });

      res.json(summary);
    } catch (error) {
      console.error("Daily summary error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Get date range summary report
router.get(
  "/date-range",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;

      if (!fromDate || !toDate) {
        return res
          .status(400)
          .json({ message: "fromDate and toDate are required" });
      }

      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      const registrations = await Registration.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("patient tests.test");

      // Group by date
      const dailyData = {};
      let totalSummary = {
        totalRegistrations: registrations.length,
        totalAmount: 0,
        cashAmount: 0,
        upiAmount: 0,
        paidAmount: 0,
        balanceAmount: 0,
      };

      registrations.forEach((reg) => {
        const dateKey = reg.createdAt.toISOString().split("T")[0];

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: dateKey,
            registrations: 0,
            totalAmount: 0,
            cashAmount: 0,
            upiAmount: 0,
            paidAmount: 0,
            balanceAmount: 0,
          };
        }

        dailyData[dateKey].registrations++;
        dailyData[dateKey].totalAmount += reg.totalAmount || 0;
        dailyData[dateKey].paidAmount += reg.paidAmount || 0;
        dailyData[dateKey].balanceAmount += reg.balanceAmount || 0;

        if (reg.paymentMethod === "Cash") {
          dailyData[dateKey].cashAmount += reg.paidAmount || 0;
        } else if (reg.paymentMethod === "UPI") {
          dailyData[dateKey].upiAmount += reg.paidAmount || 0;
        }

        // Update total summary
        totalSummary.totalAmount += reg.totalAmount || 0;
        totalSummary.paidAmount += reg.paidAmount || 0;
        totalSummary.balanceAmount += reg.balanceAmount || 0;

        if (reg.paymentMethod === "Cash") {
          totalSummary.cashAmount += reg.paidAmount || 0;
        } else if (reg.paymentMethod === "UPI") {
          totalSummary.upiAmount += reg.paidAmount || 0;
        }
      });

      const dailyReports = Object.values(dailyData).sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      res.json({
        fromDate,
        toDate,
        totalSummary,
        dailyReports,
      });
    } catch (error) {
      console.error("Date range report error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Get payment method summary
router.get(
  "/payment-summary",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;

      const filter = {};
      if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) {
          const startDate = new Date(fromDate);
          startDate.setHours(0, 0, 0, 0);
          filter.createdAt.$gte = startDate;
        }
        if (toDate) {
          const endDate = new Date(toDate);
          endDate.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = endDate;
        }
      }

      const registrations = await Registration.find(filter);

      const summary = {
        cash: { count: 0, amount: 0 },
        upi: { count: 0, amount: 0 },
        total: { count: registrations.length, amount: 0 },
      };

      registrations.forEach((reg) => {
        summary.total.amount += reg.paidAmount || 0;

        if (reg.paymentMethod === "Cash") {
          summary.cash.count++;
          summary.cash.amount += reg.paidAmount || 0;
        } else if (reg.paymentMethod === "UPI") {
          summary.upi.count++;
          summary.upi.amount += reg.paidAmount || 0;
        }
      });

      res.json(summary);
    } catch (error) {
      console.error("Payment summary error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
