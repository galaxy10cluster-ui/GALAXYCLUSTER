// src/utils/ipHash.js
//
// Debate participants only give a display name (no signup), but the admin
// panel still needs to be able to ban abusive participants by IP. We never
// store raw IPs — only a salted hash — so this stays privacy-respecting
// while still letting moderation work.

const crypto = require("crypto");

const SALT = process.env.JWT_SECRET || "fallback_salt_change_me";

function hashIp(ip) {
  return crypto.createHash("sha256").update(`${ip}:${SALT}`).digest("hex");
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "unknown";
}

module.exports = { hashIp, getClientIp };
