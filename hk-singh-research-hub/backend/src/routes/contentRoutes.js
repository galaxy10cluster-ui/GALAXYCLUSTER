// src/routes/contentRoutes.js
const express = require("express");
const { createContentController } = require("../controllers/contentController");
const { requireAdmin } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");

/**
 * Builds a router for one content type (paper/video/audio/document).
 * Public: list, getBySlug, recordDownload
 * Admin-only: create, update, delete
 */
function buildContentRouter(modelName, opts) {
  const router = express.Router();
  const ctrl = createContentController(modelName, opts);
  const upload = makeUploader(opts.uploadType);

  router.get("/", ctrl.list);
  router.get("/:slug", ctrl.getBySlug);
  router.post("/:id/download", ctrl.recordDownload);
  if (modelName === "video") {
    router.post("/:id/like", async (req, res) => {
      const prisma = require("../utils/prisma");
      const updated = await prisma.video.update({
        where: { id: req.params.id },
        data: { likes: { increment: 1 } },
      });
      res.json({ likes: updated.likes });
    });
  }

  router.post("/", requireAdmin, upload, ctrl.create);
  router.put("/:id", requireAdmin, upload, ctrl.update);
  router.delete("/:id", requireAdmin, ctrl.remove);

  return router;
}

module.exports = { buildContentRouter };
