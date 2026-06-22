// src/utils/storage.js
//
// Storage abstraction. Default driver writes to local disk under /uploads
// (served statically by Express). To move to S3 or Cloudinary later:
//   1. Set STORAGE_DRIVER=s3 (or "cloudinary") in .env
//   2. Fill in the matching keys in .env
//   3. Implement the upload()/delete() branches below for that driver
// No other code in the app needs to change — every route calls these
// two functions only.

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

const FOLDER_BY_TYPE = {
  paper: "papers",
  video: "videos",
  audio: "audio",
  document: "documents",
  debate: "debate-uploads",
  image: "images",
};

function ensureFolder(folder) {
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Persists an uploaded file buffer and returns a public URL path.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {keyof FOLDER_BY_TYPE} type
 */
async function saveFile(buffer, originalName, type) {
  const driver = process.env.STORAGE_DRIVER || "local";

  if (driver === "local") {
    const folder = FOLDER_BY_TYPE[type] || "documents";
    const dir = ensureFolder(folder);
    const ext = path.extname(originalName) || "";
    const filename = `${uuidv4()}${ext}`;
    fs.writeFileSync(path.join(dir, filename), buffer);
    return `/uploads/${folder}/${filename}`;
  }

  if (driver === "s3") {
    throw new Error(
      "S3 driver not yet configured — add AWS keys to .env and implement saveFile() in storage.js using @aws-sdk/client-s3."
    );
  }

  if (driver === "cloudinary") {
    throw new Error(
      "Cloudinary driver not yet configured — add Cloudinary keys to .env and implement saveFile() in storage.js using the cloudinary SDK."
    );
  }

  throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
}

/** Deletes a previously-saved file given the public URL path returned by saveFile(). */
async function deleteFile(publicUrl) {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "local" && publicUrl?.startsWith("/uploads/")) {
    const filePath = path.join(UPLOAD_ROOT, publicUrl.replace("/uploads/", ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  // s3 / cloudinary deletion would go here once configured
}

module.exports = { saveFile, deleteFile, UPLOAD_ROOT, FOLDER_BY_TYPE };
