const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Test = require("../models/Test");

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm",
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    console.log("Cleared users");

    // Create admin user
    const admin = new User({
      name: "Admin User",
      username: "admin",
      password: "admin123",
      role: "admin",
      isActive: true,
    });
    await admin.save();
    console.log("Created admin user");

    // Create staff user
    const staff = new User({
      name: "Staff User 1",
      username: "staff1",
      password: "password123",
      role: "staff",
      isActive: true,
      labCode: "LAB001",
    });
    await staff.save();
    console.log("Created staff user");

    // Verify users
    const users = await User.find();
    console.log("\nUsers in database:");
    users.forEach((u) => {
      console.log(`- ${u.username} (${u.role})`);
    });

    console.log("\n✅ Database seeded successfully!");
    console.log("\nDemo Credentials:");
    console.log("Admin - username: admin, password: admin123");
    console.log("Staff - username: staff1, password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
