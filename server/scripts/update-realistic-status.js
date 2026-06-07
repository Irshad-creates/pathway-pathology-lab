const mongoose = require("mongoose");
const Registration = require("../models/Registration");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/pathology-crm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const technicians = [
  "Dr. Rajesh Kumar",
  "Dr. Priya Sharma",
  "Dr. Amit Patel",
  "Dr. Sunita Singh",
  "Dr. Vikram Mehta",
  "Lab Tech - Ravi",
  "Lab Tech - Meera",
  "Lab Tech - Suresh",
];

async function updateRealisticStatus() {
  try {
    console.log(
      "🔄 Updating registrations with realistic status progression...",
    );

    const registrations = await Registration.find({});
    console.log(`📊 Found ${registrations.length} registrations to update`);

    let updated = 0;

    for (const reg of registrations) {
      const regDate = new Date(reg.createdAt);
      const now = new Date();
      const daysSinceRegistration = Math.floor(
        (now - regDate) / (1000 * 60 * 60 * 24),
      );

      // Determine realistic status based on age of registration
      let newStatus = "Registration";
      let sampleCollectedAt = null;
      let processingStartedAt = null;
      let reportReadyAt = null;
      let printedAt = null;
      let completedAt = null;
      let technician = null;

      if (daysSinceRegistration >= 0) {
        // Status progression based on realistic lab workflow
        if (daysSinceRegistration >= 7) {
          // Old registrations - mostly completed
          const statusOptions = ["Completed", "Printed", "Report Ready"];
          newStatus = getRandomElement(statusOptions);

          // Set all timestamps for completed workflow
          sampleCollectedAt = new Date(regDate.getTime() + 1 * 60 * 60 * 1000); // 1 hour after registration
          processingStartedAt = new Date(
            regDate.getTime() + 4 * 60 * 60 * 1000,
          ); // 4 hours after registration
          reportReadyAt = new Date(regDate.getTime() + 24 * 60 * 60 * 1000); // Next day
          technician = getRandomElement(technicians);

          if (newStatus === "Printed" || newStatus === "Completed") {
            printedAt = new Date(regDate.getTime() + 26 * 60 * 60 * 1000); // 2 hours after ready
          }

          if (newStatus === "Completed") {
            completedAt = new Date(regDate.getTime() + 48 * 60 * 60 * 1000); // 2 days after registration
          }
        } else if (daysSinceRegistration >= 3) {
          // Recent registrations - in progress
          const statusOptions = ["Processing", "Report Ready", "Printed"];
          newStatus = getRandomElement(statusOptions);

          sampleCollectedAt = new Date(regDate.getTime() + 2 * 60 * 60 * 1000);
          processingStartedAt = new Date(
            regDate.getTime() + 6 * 60 * 60 * 1000,
          );
          technician = getRandomElement(technicians);

          if (newStatus === "Report Ready" || newStatus === "Printed") {
            reportReadyAt = new Date(regDate.getTime() + 20 * 60 * 60 * 1000);
          }

          if (newStatus === "Printed") {
            printedAt = new Date(regDate.getTime() + 22 * 60 * 60 * 1000);
          }
        } else if (daysSinceRegistration >= 1) {
          // Yesterday's registrations - early stages
          const statusOptions = ["Sample Collected", "Processing"];
          newStatus = getRandomElement(statusOptions);

          sampleCollectedAt = new Date(regDate.getTime() + 3 * 60 * 60 * 1000);

          if (newStatus === "Processing") {
            processingStartedAt = new Date(
              regDate.getTime() + 8 * 60 * 60 * 1000,
            );
            technician = getRandomElement(technicians);
          }
        } else {
          // Today's registrations - very early stages
          const statusOptions = [
            "Registration",
            "Sample Pending",
            "Sample Collected",
          ];
          newStatus = getRandomElement(statusOptions);

          if (newStatus === "Sample Collected") {
            sampleCollectedAt = new Date(
              regDate.getTime() + 1 * 60 * 60 * 1000,
            );
          }
        }

        // Special case: Some registrations might be stuck in "Sample Pending" due to patient no-show
        if (Math.random() < 0.05 && daysSinceRegistration >= 2) {
          newStatus = "Sample Pending";
          sampleCollectedAt = null;
          processingStartedAt = null;
          reportReadyAt = null;
          printedAt = null;
          completedAt = null;
          technician = null;
        }
      }

      // Update the registration
      await Registration.findByIdAndUpdate(reg._id, {
        status: newStatus,
        sampleCollectedAt,
        processingStartedAt,
        reportReadyAt,
        printedAt,
        completedAt,
        technician,
      });

      updated++;

      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated} registrations...`);
      }
    }

    console.log(
      `\n🎉 Successfully updated ${updated} registrations with realistic status!`,
    );

    // Show status distribution
    const statusStats = await Registration.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log("\n📊 STATUS DISTRIBUTION:");
    console.log("======================");
    statusStats.forEach((stat) => {
      const percentage = ((stat.count / registrations.length) * 100).toFixed(1);
      console.log(`${stat._id}: ${stat.count} (${percentage}%)`);
    });

    // Show processing times
    const processingStats = await Registration.aggregate([
      {
        $match: {
          sampleCollectedAt: { $exists: true },
          reportReadyAt: { $exists: true },
        },
      },
      {
        $project: {
          processingHours: {
            $divide: [
              { $subtract: ["$reportReadyAt", "$sampleCollectedAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: "$processingHours" },
          minProcessingTime: { $min: "$processingHours" },
          maxProcessingTime: { $max: "$processingHours" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (processingStats.length > 0) {
      const stats = processingStats[0];
      console.log("\n⏱️  PROCESSING TIME ANALYSIS:");
      console.log("============================");
      console.log(`Samples processed: ${stats.count}`);
      console.log(
        `Average processing time: ${stats.avgProcessingTime.toFixed(1)} hours`,
      );
      console.log(
        `Fastest processing: ${stats.minProcessingTime.toFixed(1)} hours`,
      );
      console.log(
        `Slowest processing: ${stats.maxProcessingTime.toFixed(1)} hours`,
      );
    }
  } catch (error) {
    console.error("❌ Error updating status:", error);
  } finally {
    mongoose.connection.close();
  }
}

updateRealisticStatus();
