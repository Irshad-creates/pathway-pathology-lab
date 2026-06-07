const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Create staff (admin only)
router.post("/", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, username, password, labCode } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const staff = new User({
      name,
      username,
      password,
      role: "staff",
      labCode,
    });

    await staff.save();

    // Emit real-time update
    if (req.io) {
      req.io.to("staff").emit("staff-created", {
        staff: { ...staff.toObject(), password: undefined },
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: "Staff created", id: staff._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all staff
router.get("/", authMiddleware(["admin", "staff"]), async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all technicians (for lab workflow)
router.get(
  "/technicians/list",
  authMiddleware(["admin", "staff", "technician"]),
  async (req, res) => {
    try {
      const technicians = await User.find({
        role: "technician",
        isActive: true,
      }).select("-password");
      res.json(technicians);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Create technician (admin only)
router.post("/technician", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, username, password, specialization } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const technician = new User({
      name,
      username,
      password,
      role: "technician",
      specialization,
    });

    await technician.save();

    // Emit real-time update
    if (req.io) {
      req.io.to("staff").emit("technician-created", {
        technician: { ...technician.toObject(), password: undefined },
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: "Technician created", id: technician._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Disable staff
router.put("/:id/disable", authMiddleware(["admin"]), async (req, res) => {
  try {
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    // Emit real-time update
    if (req.io) {
      req.io.to("staff").emit("staff-updated", {
        staff: { ...staff.toObject(), password: undefined },
        timestamp: new Date(),
      });
    }

    res.json({ message: "Staff disabled", staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password
router.put(
  "/:id/reset-password",
  authMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const staff = await User.findById(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }

      staff.password = newPassword;
      await staff.save();

      // Emit real-time update
      if (req.io) {
        req.io.to("staff").emit("staff-updated", {
          staff: { ...staff.toObject(), password: undefined },
          timestamp: new Date(),
        });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Change password (self)
router.put(
  "/change-password",
  authMiddleware(["staff", "admin"]),
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      const isValid = await user.comparePassword(oldPassword);
      if (!isValid) {
        return res.status(401).json({ message: "Old password incorrect" });
      }

      user.password = newPassword;
      await user.save();
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
