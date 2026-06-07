const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Registration = require("../models/Registration");
const Test = require("../models/Test");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/pathology-crm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const paymentMethods = ["Cash", "UPI", "Send to WhatsApp (Pending)"];
const testStatuses = ["Registration", "Pending", "Completed", "Printed"];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLabCode() {
  return `LAB${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function createRealisticPatientVisits() {
  try {
    console.log("🏥 Creating realistic patient visit patterns...");

    // Get existing patients and tests
    const existingPatients = await Patient.find({});
    const tests = await Test.find({});

    if (existingPatients.length === 0) {
      console.log(
        "❌ No existing patients found. Run seed-full-month-data.js first!",
      );
      return;
    }

    console.log(`📊 Found ${existingPatients.length} existing patients`);
    console.log(`🧪 Found ${tests.length} available tests`);

    let totalNewRegistrations = 0;

    // Create multiple visits for existing patients
    for (let i = 0; i < existingPatients.length; i++) {
      const patient = existingPatients[i];

      // 30% chance of having multiple visits
      const hasMultipleVisits = Math.random() < 0.3;

      if (hasMultipleVisits) {
        // Create 1-3 additional visits for this patient
        const additionalVisits = getRandomNumber(1, 3);

        for (let visit = 0; visit < additionalVisits; visit++) {
          // Create registration date (spread over last 6 months)
          const daysAgo = getRandomNumber(1, 180);
          const registrationDate = new Date();
          registrationDate.setDate(registrationDate.getDate() - daysAgo);
          registrationDate.setHours(getRandomNumber(8, 18));
          registrationDate.setMinutes(getRandomNumber(0, 59));

          // Select random tests (1-4 tests per visit)
          const numTests = getRandomNumber(1, 4);
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

          // Payment scenarios
          const paymentMethod = getRandomElement(paymentMethods);
          let paidAmount, balanceAmount;

          if (paymentMethod === "Send to WhatsApp (Pending)") {
            paidAmount = 0;
            balanceAmount = netAmount;
          } else {
            // 80% chance of full payment for return patients
            if (Math.random() < 0.8) {
              paidAmount = netAmount;
              balanceAmount = 0;
            } else {
              paidAmount = Math.floor(
                (netAmount * getRandomNumber(50, 90)) / 100,
              );
              balanceAmount = netAmount - paidAmount;
            }
          }

          // Create the additional registration
          const registration = new Registration({
            labCode: generateLabCode(),
            patient: patient._id,
            tests: selectedTests,
            totalAmount: totalAmount,
            discountAmount: discountAmount,
            netAmount: netAmount,
            paidAmount: paidAmount,
            balanceAmount: balanceAmount,
            paymentMethod: paymentMethod,
            status: getRandomElement(testStatuses),
            comment:
              visit === 0
                ? "Follow-up visit"
                : visit === 1
                  ? "Regular checkup"
                  : "Routine tests",
            createdAt: registrationDate,
            updatedAt: registrationDate,
          });

          await registration.save();
          totalNewRegistrations++;

          // Show progress
          if (totalNewRegistrations % 50 === 0) {
            console.log(
              `✅ Created ${totalNewRegistrations} additional registrations...`,
            );
          }
        }
      }
    }

    console.log(
      `\n🎉 Successfully created ${totalNewRegistrations} additional registrations!`,
    );

    // Show updated statistics
    const patientStats = await Registration.aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      {
        $unwind: "$patientInfo",
      },
      {
        $group: {
          _id: "$patientInfo.name",
          visitCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastVisit: { $max: "$createdAt" },
        },
      },
      {
        $sort: { visitCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    console.log("\n📊 TOP PATIENTS BY VISIT COUNT:");
    console.log("================================");
    patientStats.forEach((patient, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      console.log(
        `${medal} ${patient._id}: ${patient.visitCount} visits, ₹${patient.totalSpent.toFixed(2)} total`,
      );
    });

    // Show patients with multiple visits
    const multipleVisitPatients = patientStats.filter((p) => p.visitCount > 1);
    console.log(
      `\n✨ ${multipleVisitPatients.length} patients now have multiple visits!`,
    );
    console.log(
      `📈 Average visits per returning patient: ${(multipleVisitPatients.reduce((sum, p) => sum + p.visitCount, 0) / multipleVisitPatients.length).toFixed(1)}`,
    );
  } catch (error) {
    console.error("❌ Error creating realistic patient visits:", error);
  } finally {
    mongoose.connection.close();
  }
}

createRealisticPatientVisits();
