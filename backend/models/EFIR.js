import mongoose from "mongoose";

const EFIRSchema = new mongoose.Schema({
  touristId: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("EFIR", EFIRSchema);
