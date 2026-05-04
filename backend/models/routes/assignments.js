import express from "express";
import Assignment from "../Assignment.js";
import Alert from "../Alert.js";
import { authenticate, authorizePolice } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, authorizePolice, async (req, res) => {
  try {
    const { alertId, officerName, officerContact } = req.body;
    if (!alertId || !officerName || !officerContact) {
      return res.status(400).json({ error: "alertId, officerName, officerContact required" });
    }

    const existing = await Assignment.findOne({ alertId });
    if (existing) return res.status(409).json({ error: "Officer already assigned to this alert" });

    const assignment = await Assignment.create({ alertId, officerName, officerContact });

    // emit via socket if available
    const io = req.app.get("io");
    if (io) io.emit("officer_assigned", { alertId, officerName, officerContact });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ assignedAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", authenticate, authorizePolice, async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === "resolved" ? { resolvedAt: new Date() } : {}) },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    const io = req.app.get("io");
    if (io) io.emit("assignment_updated", assignment);

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
