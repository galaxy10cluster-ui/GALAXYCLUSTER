// src/controllers/aiController.js
//
// AI summarization for research papers, using the Anthropic API directly.
// Requires ANTHROPIC_API_KEY in .env (get one at console.anthropic.com).
// This is intentionally a thin wrapper — swap the model name or prompt
// freely without touching any other part of the app.

const prisma = require("../utils/prisma");

async function summarizePaper(req, res) {
  const { id } = req.params;
  const paper = await prisma.paper.findUnique({ where: { id } });
  if (!paper) return res.status(404).json({ error: "Paper not found" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(501).json({
      error: "AI summarization not configured. Add ANTHROPIC_API_KEY to backend/.env to enable this feature.",
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Summarize the following research paper abstract in 3-4 sentences for a general audience. Be accurate and neutral, and note clearly if it is a speculative or non-peer-reviewed hypothesis.\n\nTitle: ${paper.title}\n\nAbstract: ${paper.abstract}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const summary = data?.content?.find((b) => b.type === "text")?.text || "";

    const updated = await prisma.paper.update({
      where: { id },
      data: { aiSummary: summary },
    });

    res.json({ aiSummary: updated.aiSummary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI summarization failed", detail: err.message });
  }
}

module.exports = { summarizePaper };
