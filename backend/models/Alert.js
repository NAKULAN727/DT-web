import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  touristId: String,
  message: String,
  location: {
    lat: Number,
    lng: Number
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Alert", AlertSchema);
