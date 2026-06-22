// src/middleware/upload.js
//
// Validates file type + size BEFORE it ever touches storage.js. This is the
// app's main defense against malicious uploads (XSS via SVG, executables
// renamed with safe extensions, oversized files, etc).

const multer = require("multer");

const MIME_WHITELIST = {
  paper: ["application/pdf"],
  video: ["video/mp4", "video/webm"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"],
  document: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "text/plain",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    "application/vnd.ms-powerpoint",
  ],
  debate: [
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "application/pdf",
    "image/png",
    "image/jpeg",
  ],
  image: ["image/png", "image/jpeg", "image/webp"],
};

const MAX_SIZE_BYTES = {
  paper: 25 * 1024 * 1024, // 25MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  document: 25 * 1024 * 1024,
  debate: 100 * 1024 * 1024,
  image: 5 * 1024 * 1024,
};

const storage = multer.memoryStorage();

function makeUploader(type) {
  return multer({
    storage,
    limits: { fileSize: MAX_SIZE_BYTES[type] || 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = MIME_WHITELIST[type] || [];
      if (!allowed.includes(file.mimetype)) {
        return cb(
          new Error(
            `Invalid file type "${file.mimetype}" for ${type}. Allowed: ${allowed.join(", ")}`
          )
        );
      }
      cb(null, true);
    },
  }).single("file");
}

module.exports = { makeUploader, MIME_WHITELIST, MAX_SIZE_BYTES };
