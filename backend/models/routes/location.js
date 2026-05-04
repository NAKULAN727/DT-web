import express from "express";
import Tourist from "../Tourist.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { touristId, name, lat, lng } = req.body;
    if (!touristId || lat == null || lng == null) {
      return res.status(400).json({ error: "touristId, lat, and lng are required" });
    }

    const tourist = await Tourist.findOneAndUpdate(
      { touristId },
      { name: name || "Unknown", lat, lng, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");
    if (io) io.emit("location_update", tourist);

    res.json({ success: true, tourist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const tourists = await Tourist.find().sort({ lastSeen: -1 });
    res.json(tourists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
