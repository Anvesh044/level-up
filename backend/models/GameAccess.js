const mongoose = require("mongoose");

const GameAccessSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  teacherId: { type: String, required: true },

  games: {
    choiceQuest: { type: Boolean, default: true },
    flashcards: { type: Boolean, default: true },
    sentenceShuffle: { type: Boolean, default: true },
    wordHunt: { type: Boolean, default: true },
    sketchMatch: { type: Boolean, default: true },
    echoSpeak: { type: Boolean, default: true },
    rapidFire: { type: Boolean, default: true },
    bugScope: { type: Boolean, default: true },
    outputOracle: { type: Boolean, default: true },
  },

  maxDifficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameAccess", GameAccessSchema);
