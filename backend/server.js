const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection (CORRECT)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("📦 DB NAME:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
  });

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});
const gameAccessRoutes = require("./routes/gameAccessroutes");
app.use("/api/game-access", gameAccessRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
