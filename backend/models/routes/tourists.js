import express from "express";
import User from "../User.js";

const router = express.Router();

// Get all tourists
router.get("/", async (req, res) => {
  try {
    const tourists = await User.find({ role: "tourist" }).select("-password");
    res.json(tourists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
