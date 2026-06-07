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
    await Test.deleteMany({});
    console.log("Cleared existing data");

    // Seed users
    const users = [
      {
        name: "Admin User",
        username: "admin",
        password: "admin123",
        role: "admin",
        isActive: true,
      },
      {
        name: "Staff User 1",
        username: "staff1",
        password: "password123",
        role: "staff",
        isActive: true,
        labCode: "LAB001",
      },
      {
        name: "Staff User 2",
        username: "staff2",
        password: "password123",
        role: "staff",
        isActive: true,
        labCode: "LAB001",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Seed tests
    const tests = [
      {
        name: "CHLORIDE, SERUM (CLED)",
        shortName: "CHLORIDE",
        category: "Chemistry",
        price: 150,
        isFavourite: true,
      },
      {
        name: "C-REACTIVE PROTEIN (CRP)",
        shortName: "CRP",
        category: "Immunology",
        price: 200,
        isFavourite: true,
      },
      {
        name: "ELECTROLYTES (ELE)",
        shortName: "ELECTROLYTES",
        category: "Chemistry",
        price: 300,
      },
      {
        name: "HEMOGLOBIN (HB)",
        shortName: "HB",
        category: "Hematology",
        price: 100,
        isFavourite: true,
      },
      {
        name: "LIPID PROFILE (LPD 1)",
        shortName: "LIPID",
        category: "Chemistry",
        price: 400,
      },
      {
        name: "LIPID PROFILE (LPD)",
        shortName: "LIPID2",
        category: "Chemistry",
        price: 400,
      },
      {
        name: "CALCIUM, SERUM (CAL)",
        shortName: "CALCIUM",
        category: "Chemistry",
        price: 250,
      },
      {
        name: "HDL CHOLESTEROL direct (HDL)",
        shortName: "HDL",
        category: "Chemistry",
        price: 300,
      },
      {
        name: "BLOOD GLUCOSE (FBS)",
        shortName: "FBS",
        category: "Chemistry",
        price: 120,
      },
      {
        name: "THYROID PROFILE (TSH)",
        shortName: "TSH",
        category: "Endocrinology",
        price: 350,
      },
      {
        name: "LIVER FUNCTION TEST (LFT)",
        shortName: "LFT",
        category: "Chemistry",
        price: 400,
      },
      {
        name: "KIDNEY FUNCTION TEST (KFT)",
        shortName: "KFT",
        category: "Chemistry",
        price: 350,
      },
      {
        name: "COMPLETE BLOOD COUNT (CBC)",
        shortName: "CBC",
        category: "Hematology",
        price: 200,
      },
      {
        name: "URINE ROUTINE (UR)",
        shortName: "UR",
        category: "Pathology",
        price: 100,
      },
      {
        name: "STOOL ROUTINE (SR)",
        shortName: "SR",
        category: "Pathology",
        price: 150,
      },
      {
        name: "BLOOD CULTURE (BC)",
        shortName: "BC",
        category: "Microbiology",
        price: 500,
      },
      {
        name: "WIDAL TEST (WT)",
        shortName: "WT",
        category: "Serology",
        price: 300,
      },
      {
        name: "DENGUE SEROLOGY (DS)",
        shortName: "DS",
        category: "Serology",
        price: 400,
      },
      {
        name: "COVID-19 RT-PCR",
        shortName: "COVID",
        category: "Virology",
        price: 600,
      },
      {
        name: "VITAMIN D (25-OH)",
        shortName: "VIT-D",
        category: "Chemistry",
        price: 450,
      },
    ];

    const createdTests = await Test.insertMany(tests);
    console.log(`Created ${createdTests.length} tests`);

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
