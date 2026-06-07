const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function createStaffUsers() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm",
    );

    const staffUsers = [
      {
        name: "Lab Staff 1",
        username: "staff1",
        password: "staff123",
      },
      {
        name: "Lab Staff 2",
        username: "staff2",
        password: "staff123",
      },
      {
        name: "Lab Staff 3",
        username: "staff3",
        password: "staff123",
      },
      {
        name: "Lab Coordinator",
        username: "coordinator",
        password: "staff123",
      },
      {
        name: "Quality Checker",
        username: "quality_checker",
        password: "staff123",
      },
    ];

    // Delete existing staff
    await User.deleteMany({ role: "staff" });
    console.log("✅ Cleared existing staff users");

    // Create new staff
    for (const staff of staffUsers) {
      const staffUser = new User({
        name: staff.name,
        username: staff.username,
        password: staff.password,
        role: "staff",
        isActive: true,
      });

      await staffUser.save();
      console.log(`✅ Created: ${staff.name}`);
    }

    console.log(`\n✅ Total staff users created: ${staffUsers.length}`);
    console.log("\nStaff Credentials:");
    console.log("==================");
    staffUsers.forEach((staff) => {
      console.log(`Name: ${staff.name}`);
      console.log(`Username: ${staff.username}`);
      console.log(`Password: staff123`);
      console.log("---");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating staff users:", error);
    process.exit(1);
  }
}

createStaffUsers();
