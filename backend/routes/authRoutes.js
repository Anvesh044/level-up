const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===============================
// SAVE USER AFTER FIREBASE SIGNUP
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { firebaseUid, role, name, institution, parentPhone } = req.body;

    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      firebaseUid,
      role,
      name,
      institution,
      parentPhone,
    });

    await user.save();

    res.status(201).json({ message: "User saved successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================
// GET USER ROLE BY FIREBASE UID (LOGIN)
// ==================================
router.get("/role/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================================
// GET STUDENTS OF A TEACHER (BY INSTITUTION)
// ==================================================
router.get("/students/:teacherFirebaseUid", async (req, res) => {
  try {
    // 1️⃣ Find the teacher
    const teacher = await User.findOne({
      firebaseUid: req.params.teacherFirebaseUid,
      role: "teacher",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2️⃣ Find students from same institution
    const students = await User.find({
      institution: teacher.institution,
      role: "student",
    });

    res.json({
      institution: teacher.institution,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
// 🔴 DEBUG — LIST ALL USERS
router.get("/debug/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});
