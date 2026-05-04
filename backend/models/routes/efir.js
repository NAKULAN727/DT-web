import express from "express";
import EFIR from "../EFIR.js";
import { authenticate, authorizePolice } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const { touristId, name, location, description } = req.body;
    if (!touristId || !name || !location || !description) {
      return res.status(400).json({ error: "All fields required: touristId, name, location, description" });
    }
    const efir = await EFIR.create({ touristId, name, location, description });
    const io = req.app.get("io");
    if (io) io.emit("new_efir", efir);
    res.status(201).json({ success: true, efir });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticate, authorizePolice, async (req, res) => {
  try {
    const efirs = await EFIR.find().sort({ submittedAt: -1 });
    res.json(efirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", authenticate, authorizePolice, async (req, res) => {
  try {
    const efir = await EFIR.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!efir) return res.status(404).json({ error: "EFIR not found" });
    res.json({ success: true, efir });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
