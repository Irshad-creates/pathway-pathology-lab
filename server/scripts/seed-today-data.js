require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Registration = require("../models/Registration");
const Test = require("../models/Test");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm";

async function seedTodayData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Get or create test patients
    let patients = await Patient.find().limit(5);
    if (patients.length === 0) {
      console.log("Creating test patients...");
      patients = await Patient.insertMany([
        {
          name: "Rajesh Kumar",
          mobile: "9876543210",
          age: 35,
          gender: "Male",
          address: "123 Main St",
        },
        {
          name: "Priya Singh",
          mobile: "9876543211",
          age: 28,
          gender: "Female",
          address: "456 Oak Ave",
        },
        {
          name: "Amit Patel",
          mobile: "9876543212",
          age: 42,
          gender: "Male",
          address: "789 Pine Rd",
        },
      ]);
    }

    // Get tests
    let tests = await Test.find().limit(5);
    if (tests.length === 0) {
      console.log("Creating test types...");
      tests = await Test.insertMany([
        {
          shortName: "CBC",
          name: "Complete Blood Count",
          category: "Hematology",
          price: 500,
          referenceRange: "4.5-11.0",
          unit: "x10^9/L",
        },
        {
          shortName: "LFT",
          name: "Liver Function Test",
          category: "Biochemistry",
          price: 800,
          referenceRange: "0.7-1.2",
          unit: "mg/dL",
        },
        {
          shortName: "RFT",
          name: "Renal Function Test",
          category: "Biochemistry",
          price: 600,
          referenceRange: "0.6-1.2",
          unit: "mg/dL",
        },
      ]);
    }

    // Create registrations for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registrations = [
      {
        labCode: `LAB-${Date.now()}-1`,
        patient: patients[0]._id,
        tests: [
          {
            test: tests[0]._id,
            testName: tests[0].name,
            price: tests[0].price,
            referenceRange: tests[0].referenceRange,
            unit: tests[0].unit,
          },
        ],
        totalAmount: 500,
        paymentMethod: "Cash",
        paidAmount: 500,
        balanceAmount: 0,
        status: "Registration",
        createdAt: new Date(today.getTime() + Math.random() * 86400000),
      },
      {
        labCode: `LAB-${Date.now()}-2`,
        patient: patients[1]._id,
        tests: [
          {
            test: tests[1]._id,
            testName: tests[1].name,
            price: tests[1].price,
            referenceRange: tests[1].referenceRange,
            unit: tests[1].unit,
          },
        ],
        totalAmount: 800,
        paymentMethod: "UPI",
        paidAmount: 800,
        balanceAmount: 0,
        status: "Sample Collected",
        createdAt: new Date(today.getTime() + Math.random() * 86400000),
      },
      {
        labCode: `LAB-${Date.now()}-3`,
        patient: patients[2]._id,
        tests: [
          {
            test: tests[2]._id,
            testName: tests[2].name,
            price: tests[2].price,
            referenceRange: tests[2].referenceRange,
            unit: tests[2].unit,
          },
          {
            test: tests[0]._id,
            testName: tests[0].name,
            price: tests[0].price,
            referenceRange: tests[0].referenceRange,
            unit: tests[0].unit,
          },
        ],
        totalAmount: 1100,
        paymentMethod: "Cash",
        paidAmount: 1100,
        balanceAmount: 0,
        status: "Processing",
        createdAt: new Date(today.getTime() + Math.random() * 86400000),
      },
      {
        labCode: `LAB-${Date.now()}-4`,
        patient: patients[0]._id,
        tests: [
          {
            test: tests[1]._id,
            testName: tests[1].name,
            price: tests[1].price,
            referenceRange: tests[1].referenceRange,
            unit: tests[1].unit,
          },
        ],
        totalAmount: 800,
        paymentMethod: "UPI",
        paidAmount: 800,
        balanceAmount: 0,
        status: "Report Ready",
        createdAt: new Date(today.getTime() + Math.random() * 86400000),
      },
    ];

    await Registration.insertMany(registrations);
    console.log(
      `✅ Created ${registrations.length} test registrations for today`,
    );

    // Show summary
    const dailyRegs = await Registration.find({
      createdAt: { $gte: today },
    });
    const totalAmount = dailyRegs.reduce(
      (sum, r) => sum + (r.totalAmount || 0),
      0,
    );
    const cashAmount = dailyRegs
      .filter((r) => r.paymentMethod === "Cash")
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    const upiAmount = dailyRegs
      .filter((r) => r.paymentMethod === "UPI")
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    console.log("\n📊 Today's Summary:");
    console.log(`Total Registrations: ${dailyRegs.length}`);
    console.log(`Total Amount: ₹${totalAmount}`);
    console.log(`Cash: ₹${cashAmount}`);
    console.log(`UPI: ₹${upiAmount}`);

    await mongoose.connection.close();
    console.log("\n✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedTodayData();
