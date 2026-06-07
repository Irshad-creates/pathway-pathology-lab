const mongoose = require("mongoose");
const Registration = require("../models/Registration");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/pathology-crm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

async function fixPaymentMethods() {
  try {
    console.log("Checking existing registrations...");

    // Find all registrations
    const registrations = await Registration.find({});
    console.log(`Found ${registrations.length} registrations`);

    let updatedCount = 0;

    for (const reg of registrations) {
      let needsUpdate = false;
      let newPaymentMethod = reg.paymentMethod;

      // Fix case issues
      if (reg.paymentMethod === "cash") {
        newPaymentMethod = "Cash";
        needsUpdate = true;
      } else if (reg.paymentMethod === "upi") {
        newPaymentMethod = "UPI";
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Registration.findByIdAndUpdate(reg._id, {
          paymentMethod: newPaymentMethod,
        });
        updatedCount++;
        console.log(
          `Updated registration ${reg._id}: ${reg.paymentMethod} -> ${newPaymentMethod}`,
        );
      }
    }

    console.log(`\nFixed ${updatedCount} registrations`);

    // Show summary of payment methods
    const summary = await Registration.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$paidAmount" },
        },
      },
    ]);

    console.log("\nPayment method summary:");
    summary.forEach((item) => {
      console.log(
        `${item._id}: ${item.count} registrations, ₹${item.totalAmount} total`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

fixPaymentMethods();
