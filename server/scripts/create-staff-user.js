const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function createStaffUser() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm",
    );

    // Create staff user
    const staffUser = new User({
      name: "Lab Staff",
      username: "staff",
      password: "staff123",
      role: "staff",
      isActive: true,
    });

    await staffUser.save();
    console.log("✅ Staff user created successfully!");
    console.log("Username: staff");
    console.log("Password: staff123");
    console.log("Role: staff");

    // Create technician user
    const techUser = new User({
      name: "Dr. Rajesh Kumar",
      username: "technician",
      password: "tech123",
      role: "technician",
      specialization: "Senior Pathologist",
      isActive: true,
    });

    await techUser.save();
    console.log("\n✅ Technician user created successfully!");
    console.log("Username: technician");
    console.log("Password: tech123");
    console.log("Role: technician");
    console.log("Specialization: Senior Pathologist");

    process.exit(0);
  } catch (error) {
    console.error("Error creating users:", error);
    process.exit(1);
  }
}

createStaffUser();
