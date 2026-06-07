const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// In-memory session store
const activeSessions = new Map(); // userId -> sessionId

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" },
  );
};

// Staff/Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    // Generate new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = generateToken(user);

    // Store session in memory (replaces any existing session for this user)
    activeSessions.set(user._id.toString(), sessionId);

    res.json({
      token,
      sessionId,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Patient Login (Name + Mobile)
router.post("/patient-login", async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ message: "Name and mobile required" });
    }

    // For demo: create or find patient
    let user = await User.findOne({ username: mobile, role: "patient" });

    if (!user) {
      user = new User({
        name,
        username: mobile,
        password: "patient-default",
        role: "patient",
      });
      await user.save();
    }

    // Generate new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = generateToken(user);

    // Store session in memory
    activeSessions.set(user._id.toString(), sessionId);

    res.json({
      token,
      sessionId,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Token
router.get("/verify", (req, res) => {
  try {
    // Disable caching
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const token = req.headers.authorization?.split(" ")[1];
    const sessionId = req.headers["x-session-id"];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // Check if this session is still active
    const activeSessionId = activeSessions.get(decoded.id);

    if (!activeSessionId) {
      return res.status(401).json({
        message: "Session not found",
        valid: false,
        reason: "logged_out_from_another_tab",
      });
    }

    if (activeSessionId !== sessionId) {
      return res.status(401).json({
        message: "Session mismatch - logged in from another tab",
        valid: false,
        reason: "session_mismatch",
      });
    }

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token", valid: false });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // Remove session
    activeSessions.delete(decoded.id);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
