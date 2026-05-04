import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./models/routes/auth.js";
import panicRoutes from "./models/routes/panic.js";
import locationRoutes from "./models/routes/location.js";
import alertsRoutes from "./models/routes/alerts.js";
import assignmentRoutes from "./models/routes/assignments.js";
import efirRoutes from "./models/routes/efir.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH"] }
});

app.use(cors());
app.use(express.json());
app.set("io", io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/panic", panicRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/efir", efirRoutes);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
