import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { entryRoutes } from "./routes/entries.js";
import { authRoutes } from "./routes/auth.js";
import { mirrorRoutes } from "./routes/mirror.js";
import { promptRoutes } from "./routes/prompts.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(clerkMiddleware());

// ─── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/mirror", mirrorRoutes);
app.use("/api/prompts", promptRoutes);

// ─── Health check ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handler (must be last) ───────────────────────────
app.use(errorHandler);

// ─── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[spectra-api] listening on port ${PORT}`);
});
