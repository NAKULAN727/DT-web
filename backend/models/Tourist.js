import mongoose from "mongoose";

const TouristSchema = new mongoose.Schema({
  touristId: { type: String, required: true, unique: true },
  name: { type: String, default: "Unknown" },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: { type: String, enum: ["safe", "help_needed", "lost", "offline"], default: "safe" },
  lastSeen: { type: Date, default: Date.now }
});

export default mongoose.model("Tourist", TouristSchema);
