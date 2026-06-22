// src/server.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { Server } = require("socket.io");

const { buildContentRouter } = require("./routes/contentRoutes");
const authRoutes = require("./routes/authRoutes");
const debateRoutes = require("./routes/debateRoutes");
const miscRoutes = require("./routes/miscRoutes");
const { attachDebateSocket } = require("./sockets/debateSocket");

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] },
});
app.set("io", io);
attachDebateSocket(io);

// ── Security & core middleware ──
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow media to be embedded by frontend
  })
);
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// ── Static file serving for uploads ──
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use(
  "/api/papers",
  buildContentRouter("paper", {
    fileField: "fileUrl",
    uploadType: "paper",
    searchFields: ["title", "description", "abstract"],
  })
);
app.use(
  "/api/videos",
  buildContentRouter("video", {
    fileField: "fileUrl",
    uploadType: "video",
    searchFields: ["title", "description"],
  })
);
app.use(
  "/api/audios",
  buildContentRouter("audio", {
    fileField: "fileUrl",
    uploadType: "audio",
    searchFields: ["title", "description"],
  })
);
app.use(
  "/api/documents",
  buildContentRouter("document", {
    fileField: "fileUrl",
    uploadType: "document",
    searchFields: ["title", "description"],
  })
);
app.use("/api/debates", debateRoutes);
app.use("/api", miscRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ── 404 + error handling ──
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`HK Singh Research Hub API running on port ${PORT}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});

module.exports = { app, server, io };
