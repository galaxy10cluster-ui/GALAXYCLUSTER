const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const analyticsCtrl = require("../controllers/analyticsController");
const taxonomyCtrl = require("../controllers/taxonomyController");
const miscCtrl = require("../controllers/miscController");
const aiCtrl = require("../controllers/aiController");

// Analytics (admin only)
router.get("/analytics/overview", requireAdmin, analyticsCtrl.overview);
router.get("/analytics/popular", requireAdmin, analyticsCtrl.mostPopular);
router.get("/analytics/engagement", requireAdmin, analyticsCtrl.engagementSeries);
router.get("/analytics/leaderboard", analyticsCtrl.leaderboard); // public "most active debaters"

// Categories & tags
router.get("/categories", taxonomyCtrl.listCategories);
router.post("/categories", requireAdmin, taxonomyCtrl.createCategory);
router.delete("/categories/:id", requireAdmin, taxonomyCtrl.deleteCategory);
router.get("/tags", taxonomyCtrl.listTags);
router.post("/tags", requireAdmin, taxonomyCtrl.createTag);
router.delete("/tags/:id", requireAdmin, taxonomyCtrl.deleteTag);

// Search, newsletter, contact, bookmarks
router.get("/search", miscCtrl.globalSearch);
router.post("/newsletter", miscCtrl.subscribeNewsletter);
router.post("/contact", miscCtrl.submitContact);
router.post("/bookmarks", miscCtrl.toggleBookmark);
router.get("/bookmarks/:sessionId", miscCtrl.getBookmarks);

// AI summarization
router.post("/papers/:id/summarize", requireAdmin, aiCtrl.summarizePaper);

module.exports = router;
