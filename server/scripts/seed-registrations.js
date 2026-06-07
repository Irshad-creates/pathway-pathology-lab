const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Patient = require("../models/Patient");
const Test = require("../models/Test");
require("dotenv").config();

async function seedRegistrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get some patients and tests
    const patients = await Patient.find().limit(5);
    const tests = await Test.find().limit(10);

    if (patients.length === 0 || tests.length === 0) {
      console.log("Please seed patients and tests first");
      process.exit(1);
    }

    // Clear existing registrations
    await Registration.deleteMany({});

    // Create sample registrations
    const registrations = [];
    for (let i = 0; i < 5; i++) {
      const patient = patients[i % patients.length];
      const selectedTests = tests.slice(0, 3 + (i % 2)).map((test) => ({
        test: test._id,
        testName: test.name,
        price: test.price,
        discountAmt: 0,
        discountPct: 0,
        refund: 0,
      }));

      const totalAmount = selectedTests.reduce((sum, t) => sum + t.price, 0);
      const discountRegn = Math.floor(totalAmount * 0.05);
      const netAmount = totalAmount - discountRegn;
      const paidAmount = netAmount;

      registrations.push({
        labCode: `LAB${Date.now()}-${i}`,
        patient: patient._id,
        tests: selectedTests,
        paymentMethod: ["Cash", "Credit Card", "UPI"][i % 3],
        totalAmount,
        discountTest: 0,
        discountRegn,
        netAmount,
        paidAmount,
        balanceAmount: 0,
        status: ["Registration", "Pending", "Printed"][i % 3],
      });
    }

    await Registration.insertMany(registrations);
    console.log(`✓ Created ${registrations.length} test registrations`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding registrations:", error);
    process.exit(1);
  }
}

seedRegistrations();
