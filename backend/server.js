import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import authRoutes from "./models/routes/auth.js";
import panicRoutes from "./models/routes/panic.js";
import locationRoutes from "./models/routes/location.js";
import alertsRoutes from "./models/routes/alerts.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/panic", panicRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/alerts", alertsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
