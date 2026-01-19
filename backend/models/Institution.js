const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      unique: true,
      required: true, // e.g. LVUP-XYZ-2026
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // teacher who created it
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
