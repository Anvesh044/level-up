const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all students of same institution
router.get("/students/:teacherUid", async (req, res) => {
  try {
    const teacher = await User.findOne({
      firebaseUid: req.params.teacherUid,
      role: "teacher",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const students = await User.find({
      role: "student",
      institution: teacher.institution,
    });

    res.json({
      institution: teacher.institution,
      totalStudents: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
