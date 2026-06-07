const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Registration = require("../models/Registration");
const Test = require("../models/Test");
const User = require("../models/User");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pathology-crm",
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedPatientData = async () => {
  try {
    console.log("Starting patient data seeding...");

    // First, ensure we have some tests in the database
    const existingTests = await Test.find();
    if (existingTests.length === 0) {
      console.log("Creating sample tests...");
      const sampleTests = [
        {
          shortName: "CBC",
          name: "Complete Blood Count",
          category: "Hematology",
          price: 500,
          isFavourite: true,
        },
        {
          shortName: "LFT",
          name: "Liver Function Test",
          category: "Biochemistry",
          price: 800,
          isFavourite: true,
        },
        {
          shortName: "KFT",
          name: "Kidney Function Test",
          category: "Biochemistry",
          price: 700,
          isFavourite: false,
        },
        {
          shortName: "TSH",
          name: "Thyroid Stimulating Hormone",
          category: "Endocrinology",
          price: 400,
          isFavourite: true,
        },
        {
          shortName: "HbA1c",
          name: "Glycated Hemoglobin",
          category: "Diabetes",
          price: 600,
          isFavourite: false,
        },
      ];
      await Test.insertMany(sampleTests);
      console.log("Sample tests created");
    }

    const tests = await Test.find();

    // Create sample patients with user accounts
    const patientData = [
      {
        name: "Rahul Sharma",
        mobile: "9876543210",
        email: "rahul.sharma@email.com",
        age: 35,
        gender: "Male",
        address: "123 MG Road, Mumbai",
        city: "Mumbai",
      },
      {
        name: "Priya Patel",
        mobile: "9876543211",
        email: "priya.patel@email.com",
        age: 28,
        gender: "Female",
        address: "456 Park Street, Delhi",
        city: "Delhi",
      },
      {
        name: "Amit Kumar",
        mobile: "9876543212",
        email: "amit.kumar@email.com",
        age: 42,
        gender: "Male",
        address: "789 Brigade Road, Bangalore",
        city: "Bangalore",
      },
      {
        name: "Sneha Reddy",
        mobile: "9876543213",
        email: "sneha.reddy@email.com",
        age: 31,
        gender: "Female",
        address: "321 Anna Salai, Chennai",
        city: "Chennai",
      },
      {
        name: "Vikram Singh",
        mobile: "9876543214",
        email: "vikram.singh@email.com",
        age: 45,
        gender: "Male",
        address: "654 Civil Lines, Pune",
        city: "Pune",
      },
    ];

    console.log("Creating patients and registrations...");

    for (const patientInfo of patientData) {
      try {
        // Check if patient already exists
        let patient = await Patient.findOne({ mobile: patientInfo.mobile });
        if (!patient) {
          // Create patient
          patient = new Patient({
            ...patientInfo,
            patientType: "OPD",
            ageUnit: "Yr",
            doctorName:
              "Dr. " +
              ["Agarwal", "Sharma", "Patel", "Kumar", "Singh"][
                Math.floor(Math.random() * 5)
              ],
            collectionCenter: "Siddhivinayak Hospital",
            isRegistered: true,
          });
          await patient.save();
          console.log(`✓ Created patient: ${patientInfo.name}`);
        } else {
          console.log(`- Patient already exists: ${patientInfo.name}`);
        }

        // Check if user account already exists
        let patientUser = await User.findOne({ username: patientInfo.mobile });
        if (!patientUser) {
          // Create user account for patient login
          patientUser = new User({
            name: patientInfo.name,
            username: patientInfo.mobile,
            password: "patient-default",
            role: "patient",
          });
          await patientUser.save();
          console.log(`✓ Created user account for: ${patientInfo.name}`);
        } else {
          console.log(`- User account already exists for: ${patientInfo.name}`);
        }

        // Check if registrations already exist for this patient
        const existingRegistrations = await Registration.find({
          patient: patient._id,
        });
        if (existingRegistrations.length > 0) {
          console.log(
            `- Registrations already exist for: ${patientInfo.name} (${existingRegistrations.length} found)`,
          );
          continue;
        }

        // Create 2-4 registrations for each patient with different dates and statuses
        const numRegistrations = Math.floor(Math.random() * 3) + 2; // 2-4 registrations

        for (let i = 0; i < numRegistrations; i++) {
          // Random date within last 3 months
          const registrationDate = new Date();
          registrationDate.setDate(
            registrationDate.getDate() - Math.floor(Math.random() * 90),
          );

          // Select 1-3 random tests
          const numTests = Math.floor(Math.random() * 3) + 1;
          const selectedTests = [];
          const usedTestIds = new Set();

          for (let j = 0; j < numTests; j++) {
            let randomTest;
            do {
              randomTest = tests[Math.floor(Math.random() * tests.length)];
            } while (usedTestIds.has(randomTest._id.toString()));

            usedTestIds.add(randomTest._id.toString());
            selectedTests.push({
              test: randomTest._id,
              testName: randomTest.name,
              price: randomTest.price,
              discountAmt: 0,
              discountPct: 0,
              refund: 0,
            });
          }

          const totalAmount = selectedTests.reduce(
            (sum, t) => sum + t.price,
            0,
          );
          const discount = Math.floor(Math.random() * 100); // 0-100 discount
          const netAmount = totalAmount - discount;
          const paymentMethods = ["Cash", "UPI"];
          const paymentMethod =
            paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

          // Determine status based on registration date
          let status;
          const daysSinceRegistration = Math.floor(
            (new Date() - registrationDate) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceRegistration < 1) {
            status = "Registration";
          } else if (daysSinceRegistration < 2) {
            status = "Pending";
          } else if (daysSinceRegistration < 7) {
            status = "Printed";
          } else {
            status = "Completed";
          }

          const registration = new Registration({
            labCode: `LAB${Date.now()}${Math.floor(Math.random() * 1000)}`,
            patient: patient._id,
            tests: selectedTests,
            totalAmount,
            discountTest: discount,
            discountRegn: 0,
            discountReason: discount > 0 ? "Regular customer discount" : "",
            netAmount,
            paymentMethod,
            paidAmount: netAmount,
            balanceAmount: 0,
            status,
            comment: i === 0 ? "Routine checkup" : "",
            createdAt: registrationDate,
            updatedAt: registrationDate,
          });

          await registration.save();
        }

        console.log(
          `✓ Created ${numRegistrations} registrations for: ${patientInfo.name}`,
        );
      } catch (error) {
        console.error(`Error processing ${patientInfo.name}:`, error.message);
        continue;
      }
    }

    console.log("\n🎉 Patient data seeding completed successfully!");
    console.log("\n📱 Test patient login credentials:");
    console.log("Name: Rahul Sharma, Mobile: 9876543210");
    console.log("Name: Priya Patel, Mobile: 9876543211");
    console.log("Name: Amit Kumar, Mobile: 9876543212");
    console.log("Name: Sneha Reddy, Mobile: 9876543213");
    console.log("Name: Vikram Singh, Mobile: 9876543214");
    console.log(
      "\n💡 Use any of these name+mobile combinations to login as a patient",
    );
  } catch (error) {
    console.error("Error seeding patient data:", error);
  }
};

const main = async () => {
  await connectDB();
  await seedPatientData();
  mongoose.connection.close();
  console.log("\n🔌 Database connection closed");
};

main();
