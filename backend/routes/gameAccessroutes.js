const express = require("express");
const router = express.Router();
const GameAccess = require("../models/GameAccess");

// 🧑‍🏫 Teacher sets access
router.post("/update", async (req, res) => {
  const { teacherId, studentId, games, maxDifficulty } = req.body;

  try {
    const updated = await GameAccess.findOneAndUpdate(
      { studentId },
      {
        teacherId,
        games,
        maxDifficulty,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👨‍🎓 Student fetches access
router.get("/:studentId", async (req, res) => {
  try {
    const access = await GameAccess.findOne({
      studentId: req.params.studentId,
    });

    res.json(access);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
