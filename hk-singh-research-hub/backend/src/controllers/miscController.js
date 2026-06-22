// src/controllers/miscController.js
const prisma = require("../utils/prisma");

async function globalSearch(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters" });
  }
  const term = q.trim();
  const insensitive = { contains: term, mode: "insensitive" };

  const [papers, videos, audios, documents] = await Promise.all([
    prisma.paper.findMany({
      where: { OR: [{ title: insensitive }, { description: insensitive }, { abstract: insensitive }] },
      take: 8,
      select: { id: true, title: true, slug: true, description: true },
    }),
    prisma.video.findMany({
      where: { OR: [{ title: insensitive }, { description: insensitive }] },
      take: 8,
      select: { id: true, title: true, slug: true, description: true },
    }),
    prisma.audio.findMany({
      where: { OR: [{ title: insensitive }, { description: insensitive }] },
      take: 8,
      select: { id: true, title: true, slug: true, description: true },
    }),
    prisma.document.findMany({
      where: { OR: [{ title: insensitive }, { description: insensitive }] },
      take: 8,
      select: { id: true, title: true, slug: true, description: true },
    }),
  ]);

  res.json({
    papers: papers.map((p) => ({ ...p, type: "paper" })),
    videos: videos.map((v) => ({ ...v, type: "video" })),
    audios: audios.map((a) => ({ ...a, type: "audio" })),
    documents: documents.map((d) => ({ ...d, type: "document" })),
  });
}

async function subscribeNewsletter(req, res) {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }
  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(200).json({ success: true, note: "Already subscribed" });
    }
    res.status(500).json({ error: "Failed to subscribe" });
  }
}

async function submitContact(req, res) {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }
  const created = await prisma.contactMessage.create({ data: { name, email, message } });
  res.status(201).json({ success: true, id: created.id });
}

async function toggleBookmark(req, res) {
  const { sessionId, contentType, contentId } = req.body;
  if (!sessionId || !contentType || !contentId) {
    return res.status(400).json({ error: "sessionId, contentType, and contentId required" });
  }

  const fkField = `${contentType.toLowerCase()}Id`;
  const existing = await prisma.bookmark.findFirst({
    where: { sessionId, [fkField]: contentId },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return res.json({ bookmarked: false });
  }

  await prisma.bookmark.create({ data: { sessionId, [fkField]: contentId } });
  res.json({ bookmarked: true });
}

async function getBookmarks(req, res) {
  const { sessionId } = req.params;
  const bookmarks = await prisma.bookmark.findMany({
    where: { sessionId },
    include: { paper: true, video: true, audio: true, document: true },
  });
  res.json(bookmarks);
}

module.exports = {
  globalSearch,
  subscribeNewsletter,
  submitContact,
  toggleBookmark,
  getBookmarks,
};
