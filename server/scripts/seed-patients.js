const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Patient = require("../models/Patient");

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm",
    );
    console.log("Connected to MongoDB");

    // Create patient users
    const patientUsers = [
      {
        name: "Rajesh Kumar",
        username: "9876543210",
        password: "patient123",
        role: "patient",
        isActive: true,
      },
      {
        name: "Priya Singh",
        username: "9876543211",
        password: "patient123",
        role: "patient",
        isActive: true,
      },
      {
        name: "Amit Patel",
        username: "9876543212",
        password: "patient123",
        role: "patient",
        isActive: true,
      },
      {
        name: "Neha Sharma",
        username: "9876543213",
        password: "patient123",
        role: "patient",
        isActive: true,
      },
      {
        name: "Vikram Desai",
        username: "9876543214",
        password: "patient123",
        role: "patient",
        isActive: true,
      },
    ];

    // Create patient records
    const patientRecords = [
      {
        patientType: "OPD",
        title: "Mr.",
        name: "Rajesh Kumar",
        gender: "Male",
        age: 45,
        ageUnit: "Yr",
        dob: "1978-05-15",
        mobile: "9876543210",
        email: "rajesh.kumar@email.com",
        address: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        doctorName: "Dr. Vikram Mehta",
        collectionCenter: "Siddhivinayak Hospital",
        affiliation: "Apollo Hospitals",
        referredDoctor: "Dr. Vikram Mehta",
        isRegistered: true,
        homeCollection: false,
        sampleCollectedAt: "Hospital",
        collectionRoundBoy: "Raj",
      },
      {
        patientType: "IPD",
        title: "Ms.",
        name: "Priya Singh",
        gender: "Female",
        age: 32,
        ageUnit: "Yr",
        dob: "1991-08-22",
        mobile: "9876543211",
        email: "priya.singh@email.com",
        address: "456 Oak Avenue, Suite 200",
        city: "Delhi",
        doctorName: "Dr. Anjali Verma",
        collectionCenter: "Max Healthcare",
        affiliation: "Max Healthcare",
        referredDoctor: "Dr. Anjali Verma",
        isRegistered: true,
        homeCollection: true,
        sampleCollectedAt: "Home",
        collectionRoundBoy: "Priya",
      },
      {
        patientType: "CASHLESS",
        title: "Mr.",
        name: "Amit Patel",
        gender: "Male",
        age: 55,
        ageUnit: "Yr",
        dob: "1968-12-10",
        mobile: "9876543212",
        email: "amit.patel@email.com",
        address: "789 Pine Road, Building C",
        city: "Bangalore",
        doctorName: "Dr. Rajesh Gupta",
        collectionCenter: "Fortis Hospital",
        affiliation: "Fortis Healthcare",
        referredDoctor: "Dr. Rajesh Gupta",
        isRegistered: true,
        homeCollection: false,
        sampleCollectedAt: "Hospital",
        collectionRoundBoy: "Amit",
      },
      {
        patientType: "WALKIN",
        title: "Ms.",
        name: "Neha Sharma",
        gender: "Female",
        age: 28,
        ageUnit: "Yr",
        dob: "1995-03-18",
        mobile: "9876543213",
        email: "neha.sharma@email.com",
        address: "321 Elm Street, Flat 5",
        city: "Pune",
        doctorName: "Dr. Sneha Desai",
        collectionCenter: "Siddhivinayak Hospital",
        affiliation: "Siddhivinayak Hospital",
        referredDoctor: "Dr. Sneha Desai",
        isRegistered: false,
        homeCollection: true,
        sampleCollectedAt: "Home",
        collectionRoundBoy: "Neha",
      },
      {
        patientType: "OPD",
        title: "Mr.",
        name: "Vikram Desai",
        gender: "Male",
        age: 62,
        ageUnit: "Yr",
        dob: "1961-07-25",
        mobile: "9876543214",
        email: "vikram.desai@email.com",
        address: "654 Maple Drive, House 12",
        city: "Hyderabad",
        doctorName: "Dr. Arjun Singh",
        collectionCenter: "Care Hospital",
        affiliation: "Care Hospitals",
        referredDoctor: "Dr. Arjun Singh",
        isRegistered: true,
        homeCollection: false,
        sampleCollectedAt: "Hospital",
        collectionRoundBoy: "Vikram",
      },
    ];

    // Clear existing patient users
    await User.deleteMany({ role: "patient" });
    console.log("Cleared existing patient users");

    // Create patient users
    const createdUsers = await User.insertMany(patientUsers);
    console.log(`Created ${createdUsers.length} patient users`);

    // Clear existing patients
    await Patient.deleteMany({});
    console.log("Cleared existing patients");

    // Create patient records
    const createdPatients = await Patient.insertMany(patientRecords);
    console.log(`Created ${createdPatients.length} patient records`);

    console.log("\n✅ Patient data seeded successfully!");
    console.log("\n📱 Patient Login Credentials:");
    console.log("=====================================");
    patientUsers.forEach((user) => {
      console.log(`Name: ${user.name}`);
      console.log(`Mobile: ${user.username}`);
      console.log(`Password: ${user.password}`);
      console.log("-------------------------------------");
    });

    console.log("\n📋 Patient Details:");
    console.log("=====================================");
    patientRecords.forEach((patient) => {
      console.log(`Name: ${patient.name}`);
      console.log(`Type: ${patient.patientType}`);
      console.log(`Age: ${patient.age} ${patient.ageUnit}`);
      console.log(`Mobile: ${patient.mobile}`);
      console.log(`City: ${patient.city}`);
      console.log(`Doctor: ${patient.doctorName}`);
      console.log("-------------------------------------");
    });

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
