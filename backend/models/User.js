const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  parentPhone: {
    type: String, // only for students
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
