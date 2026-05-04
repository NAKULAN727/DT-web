import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: "Alert", required: true },
  officerName: { type: String, required: true },
  officerContact: { type: String, required: true },
  status: { type: String, enum: ["assigned", "en_route", "resolved"], default: "assigned" },
  assignedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

export default mongoose.model("Assignment", AssignmentSchema);
