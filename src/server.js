import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notesRoutes from "./routes/notesRouts.js";
import rateLimiter from "./middleware/rateLimiter.js";
import path from "path";

dotenv.config();
const app = express();
const __dirname = path.resolve();
app.use(express.json());
app.use(rateLimiter);

if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));
}

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/analytics", analyticsRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(process.env.PORT||5001, () => console.log("Server listening"));
});
