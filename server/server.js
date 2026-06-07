const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tests", require("./routes/tests"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/registration", require("./routes/registration"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/patient-portal", require("./routes/patient-portal"));
app.use("/api/upi-payments", require("./routes/upi-payments"));
app.use("/api/status", require("./routes/status-management"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  socket.on("join-reports", () => {
    socket.join("reports");
  });

  socket.on("join-patients", () => {
    socket.join("patients");
  });

  socket.on("join-registrations", () => {
    socket.join("registrations");
  });

  socket.on("join-staff", () => {
    socket.join("staff");
  });

  socket.on("disconnect", () => {
    // Client disconnected
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
