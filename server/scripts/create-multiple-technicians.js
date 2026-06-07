const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function createTechnicians() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm",
    );

    const technicians = [
      {
        name: "Dr. Rajesh Kumar",
        username: "rajesh_kumar",
        password: "tech123",
        specialization: "Senior Pathologist",
      },
      {
        name: "Dr. Priya Sharma",
        username: "priya_sharma",
        password: "tech123",
        specialization: "Microbiologist",
      },
      {
        name: "Dr. Amit Patel",
        username: "amit_patel",
        password: "tech123",
        specialization: "Biochemist",
      },
      {
        name: "Ravi Patel",
        username: "ravi_patel",
        password: "tech123",
        specialization: "Lab Technician",
      },
      {
        name: "Meera Singh",
        username: "meera_singh",
        password: "tech123",
        specialization: "Lab Technician",
      },
      {
        name: "Dr. Sunita Singh",
        username: "sunita_singh",
        password: "tech123",
        specialization: "Hematologist",
      },
      {
        name: "Dr. Vikram Mehta",
        username: "vikram_mehta",
        password: "tech123",
        specialization: "Clinical Pathologist",
      },
      {
        name: "Suresh Kumar",
        username: "suresh_kumar",
        password: "tech123",
        specialization: "Lab Assistant",
      },
    ];

    // Delete existing technicians
    await User.deleteMany({ role: "technician" });
    console.log("✅ Cleared existing technicians");

    // Create new technicians
    for (const tech of technicians) {
      const techUser = new User({
        name: tech.name,
        username: tech.username,
        password: tech.password,
        role: "technician",
        specialization: tech.specialization,
        isActive: true,
      });

      await techUser.save();
      console.log(`✅ Created: ${tech.name} (${tech.specialization})`);
    }

    console.log(`\n✅ Total technicians created: ${technicians.length}`);
    console.log("\nTechnician Credentials:");
    console.log("========================");
    technicians.forEach((tech) => {
      console.log(`Name: ${tech.name}`);
      console.log(`Username: ${tech.username}`);
      console.log(`Password: tech123`);
      console.log(`Specialization: ${tech.specialization}`);
      console.log("---");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating technicians:", error);
    process.exit(1);
  }
}

createTechnicians();
