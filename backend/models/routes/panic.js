import express from "express";
import Alert from "../Alert.js";
import Tourist from "../Tourist.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { touristId, message, location } = req.body;

    if (!touristId || !location?.lat || !location?.lng) {
      return res.status(400).json({ error: "touristId, location.lat, and location.lng are required" });
    }
    if (location.lat === 0 && location.lng === 0) {
      return res.status(400).json({ error: "Invalid GPS coordinates (0,0). Real location required." });
    }

    const alert = new Alert({ touristId, message: message || "Emergency help needed!", location });
    await alert.save();

    await Tourist.findOneAndUpdate(
      { touristId },
      { status: "help_needed", lat: location.lat, lng: location.lng, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");
    if (io) io.emit("new_alert", alert);

    res.status(201).json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
