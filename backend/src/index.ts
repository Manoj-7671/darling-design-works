import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { projectRouter } from "./routes/project.routes";
import { engineeringRouter } from "./routes/engineering.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for client
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev mode permissive
      }
    },
    credentials: true
  })
);

app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "BuildAI Tier 2 Logic Server",
    version: "1.0.0",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/projects", projectRouter);
app.use("/api/engineering", engineeringRouter);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 BuildAI Tier 2 API Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`🏗️ Engineering API: http://localhost:${PORT}/api/engineering/calculate`);
  console.log(`📋 Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`===============================================`);
});

export default app;
