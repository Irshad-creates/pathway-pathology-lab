const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    displayName: String,
    category: String,
    price: { type: Number, required: true },
    referenceRange: { type: String }, // e.g., "4.5-11.0 x10^9/L" for WBC
    unit: { type: String }, // e.g., "x10^9/L", "g/dL", "mg/dL"
    isFavourite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Test", testSchema);
