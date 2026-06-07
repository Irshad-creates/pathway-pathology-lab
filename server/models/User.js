const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "staff", "technician", "receptionist", "patient"],
      required: true,
    },
    specialization: { type: String }, // For technicians: "Senior Pathologist", "Microbiologist", etc.
    isActive: { type: Boolean, default: true },
    labCode: String,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (pwd) {
  return await bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model("User", userSchema);
