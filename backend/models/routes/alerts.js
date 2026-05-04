import express from "express";
import Alert from "../Alert.js";
import Assignment from "../Assignment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    const assignments = await Assignment.find();

    const assignmentMap = {};
    assignments.forEach(a => { assignmentMap[a.alertId.toString()] = a; });

    const enriched = alerts.map(alert => ({
      ...alert.toObject(),
      assignment: assignmentMap[alert._id.toString()] || null
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
