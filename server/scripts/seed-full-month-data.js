const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Registration = require("../models/Registration");
const Test = require("../models/Test");
const User = require("../models/User");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/pathology-crm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// Sample data arrays
const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Shaurya",
  "Atharv",
  "Advik",
  "Pranav",
  "Rian",
  "Kabir",
  "Aryan",
  "Rudra",
  "Rohan",
  "Ravi",
  "Ananya",
  "Fatima",
  "Ira",
  "Priya",
  "Riya",
  "Anvi",
  "Larisa",
  "Anika",
  "Sara",
  "Diya",
  "Kavya",
  "Arya",
  "Myra",
  "Aishwarya",
  "Siya",
  "Pari",
  "Fatima",
  "Khushi",
  "Anaya",
  "Zara",
  "Rajesh",
  "Suresh",
  "Mahesh",
  "Ramesh",
  "Dinesh",
  "Mukesh",
  "Naresh",
  "Hitesh",
  "Jignesh",
  "Kailash",
  "Sunita",
  "Geeta",
  "Seeta",
  "Rita",
  "Nita",
  "Kavita",
  "Lalita",
  "Mamta",
  "Shanti",
  "Bharti",
];

const lastNames = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Kumar",
  "Agarwal",
  "Jain",
  "Bansal",
  "Goel",
  "Mittal",
  "Chopra",
  "Malhotra",
  "Arora",
  "Kapoor",
  "Bhatia",
  "Sethi",
  "Khanna",
  "Tandon",
  "Saxena",
  "Joshi",
  "Patel",
  "Shah",
  "Mehta",
  "Desai",
  "Modi",
  "Thakkar",
  "Pandya",
  "Vyas",
  "Trivedi",
  "Bhatt",
  "Reddy",
  "Rao",
  "Nair",
  "Menon",
  "Pillai",
  "Kumar",
  "Prasad",
  "Murthy",
  "Sastry",
  "Varma",
];

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
];

const addresses = [
  "123 MG Road",
  "456 Park Street",
  "789 Brigade Road",
  "321 Commercial Street",
  "654 Residency Road",
  "987 Infantry Road",
  "147 Richmond Road",
  "258 Cunningham Road",
  "369 Lavelle Road",
  "741 Museum Road",
  "852 Palace Road",
  "963 Sankey Road",
  "159 Vittal Mallya Road",
  "357 UB City Mall",
  "486 Forum Mall",
  "A-101 Sunrise Apartments",
  "B-205 Green Valley",
  "C-304 Royal Heights",
  "D-102 Golden Plaza",
  "E-501 Silver Towers",
];

const doctorNames = [
  "Dr. Rajesh Kumar",
  "Dr. Priya Sharma",
  "Dr. Amit Patel",
  "Dr. Sunita Gupta",
  "Dr. Vikram Singh",
  "Dr. Kavita Jain",
  "Dr. Rohit Verma",
  "Dr. Neha Agarwal",
  "Dr. Sanjay Malhotra",
  "Dr. Pooja Chopra",
  "Dr. Manoj Bansal",
  "Dr. Ritu Sethi",
  "Dr. Ashok Khanna",
  "Dr. Deepika Tandon",
  "Dr. Sunil Saxena",
];

const paymentMethods = ["Cash", "UPI", "Send to WhatsApp (Pending)"];
const testStatuses = ["Registration", "Pending", "Printed", "Completed"];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function generatePhoneNumber() {
  const prefixes = ["98", "97", "96", "95", "94", "93", "92", "91", "90", "89"];
  return (
    getRandomElement(prefixes) +
    Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0")
  );
}

function generateEmail(firstName, lastName) {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "rediffmail.com",
  ];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

function generateLabCode() {
  return (
    "LAB" +
    Date.now().toString().slice(-6) +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
  );
}

async function seedFullMonthData() {
  try {
    console.log("Starting comprehensive data seeding for January 2025...");

    // Clear existing data
    console.log("Clearing existing data...");
    await Registration.deleteMany({});
    await Patient.deleteMany({});

    // Get all available tests
    const tests = await Test.find({});
    if (tests.length === 0) {
      console.log("No tests found. Please run the test seeding script first.");
      return;
    }
    console.log(`Found ${tests.length} tests`);

    // Create patients and registrations for each day from Jan 1 to Jan 28, 2025
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-01-28");

    let totalPatients = 0;
    let totalRegistrations = 0;

    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dayOfWeek = currentDate.getDay();

      // Vary the number of registrations per day (more on weekdays, less on weekends)
      let registrationsPerDay;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sunday or Saturday
        registrationsPerDay = getRandomNumber(8, 15);
      } else {
        // Weekdays
        registrationsPerDay = getRandomNumber(15, 25);
      }

      console.log(
        `Generating ${registrationsPerDay} registrations for ${currentDate.toDateString()}`,
      );

      for (let i = 0; i < registrationsPerDay; i++) {
        // Create patient
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        const age = getRandomNumber(1, 80);

        // Generate DOB based on age
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - age);
        dob.setMonth(getRandomNumber(0, 11));
        dob.setDate(getRandomNumber(1, 28));

        const patient = new Patient({
          name: fullName,
          gender: gender,
          age: age,
          dob: dob,
          mobile: generatePhoneNumber(),
          email: generateEmail(firstName, lastName),
          address: getRandomElement(addresses),
          city: getRandomElement(cities),
          doctorName: getRandomElement(doctorNames),
          collectionCenter: "Siddhivinayak Hospital",
          affiliation: Math.random() > 0.7 ? getRandomElement(doctorNames) : "",
          isRegistered: Math.random() > 0.3,
          patientType: getRandomElement(["OPD", "IPD", "CASHLESS", "WALKIN"]),
        });

        await patient.save();
        totalPatients++;

        // Select random tests (1-5 tests per registration)
        const numTests = getRandomNumber(1, 5);
        const selectedTests = [];
        const usedTestIds = new Set();

        for (let j = 0; j < numTests; j++) {
          let randomTest;
          do {
            randomTest = getRandomElement(tests);
          } while (usedTestIds.has(randomTest._id.toString()));

          usedTestIds.add(randomTest._id.toString());
          selectedTests.push({
            test: randomTest._id,
            testName: randomTest.name,
            price: randomTest.price,
            discountAmt: Math.random() > 0.8 ? getRandomNumber(50, 200) : 0,
            discountPct: Math.random() > 0.9 ? getRandomNumber(5, 15) : 0,
            refund: 0,
          });
        }

        // Calculate amounts
        const totalAmount = selectedTests.reduce(
          (sum, test) => sum + test.price,
          0,
        );
        const discountAmount = selectedTests.reduce(
          (sum, test) => sum + (test.discountAmt || 0),
          0,
        );
        const netAmount = totalAmount - discountAmount;

        // Random payment scenarios
        const paymentMethod = getRandomElement(paymentMethods);
        let paidAmount, balanceAmount;

        if (paymentMethod === "Send to WhatsApp (Pending)") {
          paidAmount = 0;
          balanceAmount = netAmount;
        } else {
          // 70% chance of full payment, 20% partial payment, 10% overpayment
          const paymentScenario = Math.random();
          if (paymentScenario < 0.7) {
            paidAmount = netAmount; // Full payment
            balanceAmount = 0;
          } else if (paymentScenario < 0.9) {
            paidAmount = Math.floor(
              (netAmount * getRandomNumber(30, 80)) / 100,
            ); // Partial payment
            balanceAmount = netAmount - paidAmount;
          } else {
            paidAmount = netAmount + getRandomNumber(50, 200); // Overpayment
            balanceAmount = 0;
          }
        }

        const refundAmount =
          paidAmount > netAmount ? paidAmount - netAmount : 0;

        // Create registration with specific date and time
        const registrationTime = new Date(currentDate);
        registrationTime.setHours(getRandomNumber(8, 18)); // Business hours
        registrationTime.setMinutes(getRandomNumber(0, 59));
        registrationTime.setSeconds(getRandomNumber(0, 59));

        const registration = new Registration({
          labCode: generateLabCode(),
          patient: patient._id,
          tests: selectedTests,
          totalAmount: totalAmount,
          discountAmount: discountAmount,
          netAmount: netAmount,
          paidAmount: paidAmount,
          balanceAmount: balanceAmount,
          refundAmount: refundAmount,
          paymentMethod: paymentMethod,
          status: getRandomElement(testStatuses),
          comment: Math.random() > 0.7 ? "Follow-up required" : "",
          discountReason:
            discountAmount > 0
              ? getRandomElement([
                  "DR REFERENCE",
                  "STAFF RELATIVE",
                  "CHARITABLE",
                ])
              : "",
          discountAuthorization: discountAmount > 0 ? "admin" : "",
          createdAt: registrationTime,
          updatedAt: registrationTime,
        });

        await registration.save();
        totalRegistrations++;
      }
    }

    console.log("\n=== SEEDING COMPLETED ===");
    console.log(`Total Patients Created: ${totalPatients}`);
    console.log(`Total Registrations Created: ${totalRegistrations}`);

    // Generate summary statistics
    const paymentSummary = await Registration.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$paidAmount" },
        },
      },
    ]);

    console.log("\n=== PAYMENT METHOD SUMMARY ===");
    paymentSummary.forEach((item) => {
      console.log(
        `${item._id}: ${item.count} registrations, ₹${item.totalAmount.toFixed(2)} total`,
      );
    });

    const dailySummary = await Registration.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$paidAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("\n=== DAILY SUMMARY (First 5 days) ===");
    dailySummary.slice(0, 5).forEach((day) => {
      console.log(
        `${day._id}: ${day.count} registrations, ₹${day.totalAmount.toFixed(2)} total, ₹${day.paidAmount.toFixed(2)} paid`,
      );
    });

    console.log(`\n... and ${dailySummary.length - 5} more days`);

    const overallStats = await Registration.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
          totalBalance: { $sum: "$balanceAmount" },
        },
      },
    ]);

    if (overallStats.length > 0) {
      const stats = overallStats[0];
      console.log("\n=== OVERALL STATISTICS ===");
      console.log(`Total Registrations: ${stats.totalRegistrations}`);
      console.log(`Total Amount: ₹${stats.totalAmount.toFixed(2)}`);
      console.log(`Total Paid: ₹${stats.totalPaid.toFixed(2)}`);
      console.log(`Total Balance: ₹${stats.totalBalance.toFixed(2)}`);
      console.log(
        `Collection Rate: ${((stats.totalPaid / stats.totalAmount) * 100).toFixed(1)}%`,
      );
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedFullMonthData();
