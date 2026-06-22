// src/controllers/debateController.js
const prisma = require("../utils/prisma");
const sanitizeHtml = require("sanitize-html");
const { saveFile } = require("../utils/storage");
const { hashIp, getClientIp } = require("../utils/ipHash");

const SANITIZE_OPTS = {
  allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "code", "blockquote"],
  allowedAttributes: { a: ["href", "target", "rel"] },
};

function extractMentions(content) {
  const matches = content.match(/@([a-zA-Z0-9_ ]{2,30})/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).trim()))];
}

async function getRoom(req, res) {
  const room = await prisma.debateRoom.findUnique({
    where: { id: req.params.roomId },
    include: {
      paper: { select: { title: true, slug: true } },
      video: { select: { title: true, slug: true } },
      audio: { select: { title: true, slug: true } },
      document: { select: { title: true, slug: true } },
      _count: { select: { comments: true, participants: true } },
    },
  });
  if (!room) return res.status(404).json({ error: "Debate room not found" });
  res.json(room);
}

async function getComments(req, res) {
  const { roomId } = req.params;
  const { sort = "newest", category } = req.query;

  const where = { debateRoomId: roomId, parentId: null, isDeleted: false };
  if (category) where.category = category.toUpperCase();

  const orderBy =
    sort === "top" ? [{ upvotes: "desc" }] : [{ isPinned: "desc" }, { createdAt: "desc" }];

  const comments = await prisma.comment.findMany({
    where,
    orderBy,
    include: {
      attachments: true,
      replies: {
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
        include: { attachments: true },
      },
    },
  });

  res.json(comments);
}

async function joinRoom(req, res) {
  const { roomId } = req.params;
  const { displayName } = req.body;
  if (!displayName || displayName.trim().length < 2) {
    return res.status(400).json({ error: "Display name must be at least 2 characters" });
  }

  const ip = getClientIp(req);
  const ipHashVal = hashIp(ip);

  const banned = await prisma.bannedIp.findUnique({ where: { ipHash: ipHashVal } });
  if (banned) return res.status(403).json({ error: "You have been banned from participating" });

  const participant = await prisma.debateParticipant.upsert({
    where: { debateRoomId_displayName: { debateRoomId: roomId, displayName } },
    update: {},
    create: { debateRoomId: roomId, displayName, ipHash: ipHashVal },
  });

  if (participant.isBanned) {
    return res.status(403).json({ error: "This name has been banned from this room" });
  }

  res.json({ participant: { displayName: participant.displayName, joinedAt: participant.joinedAt } });
}

async function postComment(req, res) {
  const { roomId } = req.params;
  const { authorName, content, category, parentId } = req.body;

  if (!authorName || !content || !category) {
    return res.status(400).json({ error: "authorName, content, and category are required" });
  }

  const validCategories = ["SUPPORT", "OPPOSITION", "QUESTION", "ALTERNATIVE_THEORY"];
  if (!validCategories.includes(category.toUpperCase())) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const ip = getClientIp(req);
  const ipHashVal = hashIp(ip);

  const banned = await prisma.bannedIp.findUnique({ where: { ipHash: ipHashVal } });
  if (banned) return res.status(403).json({ error: "You have been banned from participating" });

  const cleanContent = sanitizeHtml(content.trim(), SANITIZE_OPTS).slice(0, 5000);
  if (!cleanContent) return res.status(400).json({ error: "Comment cannot be empty" });

  const mentions = extractMentions(cleanContent);

  const comment = await prisma.comment.create({
    data: {
      debateRoomId: roomId,
      authorName: authorName.trim().slice(0, 50),
      ipHash: ipHashVal,
      content: cleanContent,
      category: category.toUpperCase(),
      parentId: parentId || null,
      mentions,
    },
    include: { attachments: true },
  });

  await prisma.analyticsEvent.create({
    data: { eventType: "comment", contentId: roomId, metadata: { commentId: comment.id } },
  });

  // Emit live update via Socket.io (attached to app in server.js)
  const io = req.app.get("io");
  if (io) io.to(`room:${roomId}`).emit("new_comment", comment);

  res.status(201).json(comment);
}

async function uploadAttachment(req, res) {
  const { commentId } = req.params;
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  let fileType = "document";
  if (req.file.mimetype.startsWith("video/")) fileType = "video";
  else if (req.file.mimetype.startsWith("audio/")) fileType = "audio";

  const fileUrl = await saveFile(req.file.buffer, req.file.originalname, "debate");

  const attachment = await prisma.debateUpload.create({
    data: { commentId, fileUrl, fileType },
  });

  res.status(201).json(attachment);
}

async function vote(req, res) {
  const { commentId } = req.params;
  const { direction } = req.body; // "up" | "down"

  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({ error: "direction must be 'up' or 'down'" });
  }

  const field = direction === "up" ? "upvotes" : "downvotes";
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { [field]: { increment: 1 } },
  });

  const io = req.app.get("io");
  if (io) {
    io.to(`room:${updated.debateRoomId}`).emit("vote_update", {
      commentId: updated.id,
      upvotes: updated.upvotes,
      downvotes: updated.downvotes,
    });
  }

  res.json({ upvotes: updated.upvotes, downvotes: updated.downvotes });
}

// ── Moderation (admin only) ──

async function deleteComment(req, res) {
  const { commentId } = req.params;
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });

  const io = req.app.get("io");
  if (io) io.to(`room:${updated.debateRoomId}`).emit("comment_deleted", { commentId });

  res.json({ success: true });
}

async function pinComment(req, res) {
  const { commentId } = req.params;
  const { pinned } = req.body;
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { isPinned: !!pinned },
  });

  const io = req.app.get("io");
  if (io) io.to(`room:${updated.debateRoomId}`).emit("comment_pinned", { commentId, pinned: updated.isPinned });

  res.json(updated);
}

async function banParticipant(req, res) {
  const { roomId, displayName } = req.body;
  const participant = await prisma.debateParticipant.findUnique({
    where: { debateRoomId_displayName: { debateRoomId: roomId, displayName } },
  });
  if (!participant) return res.status(404).json({ error: "Participant not found" });

  await prisma.debateParticipant.update({
    where: { id: participant.id },
    data: { isBanned: true },
  });
  await prisma.bannedIp.upsert({
    where: { ipHash: participant.ipHash },
    update: {},
    create: { ipHash: participant.ipHash, reason: `Banned via display name: ${displayName}` },
  });

  res.json({ success: true });
}

async function unbanIp(req, res) {
  const { ipHash } = req.params;
  await prisma.bannedIp.delete({ where: { ipHash } }).catch(() => {});
  res.json({ success: true });
}

module.exports = {
  getRoom,
  getComments,
  joinRoom,
  postComment,
  uploadAttachment,
  vote,
  deleteComment,
  pinComment,
  banParticipant,
  unbanIp,
};
