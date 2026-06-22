// src/controllers/analyticsController.js
const prisma = require("../utils/prisma");

async function overview(req, res) {
  const [papers, videos, audios, documents, comments, participants] = await Promise.all([
    prisma.paper.aggregate({ _sum: { views: true, downloads: true }, _count: true }),
    prisma.video.aggregate({ _sum: { views: true, likes: true }, _count: true }),
    prisma.audio.aggregate({ _sum: { plays: true, downloads: true }, _count: true }),
    prisma.document.aggregate({ _sum: { views: true, downloads: true }, _count: true }),
    prisma.comment.count({ where: { isDeleted: false } }),
    prisma.debateParticipant.count(),
  ]);

  res.json({
    totals: {
      contentItems: papers._count + videos._count + audios._count + documents._count,
      papers: papers._count,
      videos: videos._count,
      audios: audios._count,
      documents: documents._count,
      views:
        (papers._sum.views || 0) + (videos._sum.views || 0) + (documents._sum.views || 0),
      downloads:
        (papers._sum.downloads || 0) +
        (audios._sum.downloads || 0) +
        (documents._sum.downloads || 0),
      comments,
      debateParticipants: participants,
    },
  });
}

async function mostPopular(req, res) {
  const [topPapers, topVideos, topAudios] = await Promise.all([
    prisma.paper.findMany({ orderBy: { views: "desc" }, take: 5, select: { title: true, slug: true, views: true } }),
    prisma.video.findMany({ orderBy: { views: "desc" }, take: 5, select: { title: true, slug: true, views: true } }),
    prisma.audio.findMany({ orderBy: { plays: "desc" }, take: 5, select: { title: true, slug: true, plays: true } }),
  ]);
  res.json({ topPapers, topVideos, topAudios });
}

async function engagementSeries(req, res) {
  // Last 14 days of comment activity, grouped by day, for the admin engagement graph
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, eventType: true },
  });

  const byDay = {};
  events.forEach((e) => {
    const day = e.createdAt.toISOString().slice(0, 10);
    byDay[day] = byDay[day] || { date: day, comment: 0, view: 0, download: 0, debate_join: 0 };
    byDay[day][e.eventType] = (byDay[day][e.eventType] || 0) + 1;
  });

  res.json(Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)));
}

async function leaderboard(req, res) {
  const top = await prisma.comment.groupBy({
    by: ["authorName"],
    where: { isDeleted: false },
    _count: { authorName: true },
    orderBy: { _count: { authorName: "desc" } },
    take: 10,
  });
  res.json(top.map((t) => ({ name: t.authorName, comments: t._count.authorName })));
}

module.exports = { overview, mostPopular, engagementSeries, leaderboard };
