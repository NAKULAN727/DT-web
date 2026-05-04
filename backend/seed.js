import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await User.findOne({ email: "police@sih.gov" });
  if (existing) {
    console.log("Police user already exists:", existing.email);
  } else {
    const user = await User.create({
      email: "police@sih.gov",
      password: "police123",
      name: "Police Admin",
      role: "police"
    });
    console.log("Police user created:", user.email);
  }
  mongoose.disconnect();
}).catch(err => { console.error(err); process.exit(1); });
