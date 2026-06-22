const express = require("express");
const router = express.Router();
const debateCtrl = require("../controllers/debateController");
const { requireAdmin } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");
const rateLimit = require("express-rate-limit");

const postLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // max 10 comments per minute per IP — basic spam protection
  message: { error: "Too many comments — please slow down." },
});

const debateUpload = makeUploader("debate");

// Public
router.get("/:roomId", debateCtrl.getRoom);
router.get("/:roomId/comments", debateCtrl.getComments);
router.post("/:roomId/join", debateCtrl.joinRoom);
router.post("/:roomId/comments", postLimiter, debateCtrl.postComment);
router.post("/comments/:commentId/attachments", debateUpload, debateCtrl.uploadAttachment);
router.post("/comments/:commentId/vote", debateCtrl.vote);

// Admin moderation
router.delete("/comments/:commentId", requireAdmin, debateCtrl.deleteComment);
router.patch("/comments/:commentId/pin", requireAdmin, debateCtrl.pinComment);
router.post("/ban", requireAdmin, debateCtrl.banParticipant);
router.delete("/ban/:ipHash", requireAdmin, debateCtrl.unbanIp);

module.exports = router;
