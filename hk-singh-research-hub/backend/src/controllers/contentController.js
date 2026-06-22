// src/controllers/contentController.js
//
// Papers, Videos, Audios, and Documents share ~90% of their CRUD logic
// (list with search/filter/pagination, get-by-slug, create, update, delete,
// view/download counters). This factory generates a controller for each
// Prisma model so we're not duplicating the same code four times.

const prisma = require("../utils/prisma");
const slugify = require("slugify");
const { saveFile, deleteFile } = require("../utils/storage");
const { v4: uuidv4 } = require("uuid");

/**
 * @param {string} modelName - prisma model key, e.g. "paper", "video"
 * @param {object} opts
 * @param {string} opts.fileField - the field name holding the main file URL
 * @param {string} opts.uploadType - storage.js folder type ("paper"|"video"|"audio"|"document")
 * @param {string[]} opts.searchFields - fields to text-search across
 */
function createContentController(modelName, opts) {
  const model = prisma[modelName];
  const { fileField, uploadType, searchFields } = opts;

  async function ensureDebateRoom(itemId, contentType) {
    const fkField = `${modelName}Id`;
    const existing = await prisma.debateRoom.findFirst({ where: { [fkField]: itemId } });
    if (existing) return existing;
    return prisma.debateRoom.create({
      data: { contentType, [fkField]: itemId },
    });
  }

  return {
    async list(req, res) {
      const { q, category, tag, sort = "newest", page = 1, limit = 12 } = req.query;
      const where = {};

      if (q) {
        where.OR = searchFields.map((f) => ({
          [f]: { contains: q, mode: "insensitive" },
        }));
      }
      if (category) where.category = { slug: category };
      if (tag) where.tags = { some: { slug: tag } };

      const take = Math.min(parseInt(limit, 10) || 12, 50);
      const skip = (Math.max(parseInt(page, 10), 1) - 1) * take;

      const orderBy =
        sort === "popular"
          ? [{ views: "desc" }]
          : [{ createdAt: "desc" }];

      const [items, total] = await Promise.all([
        model.findMany({
          where,
          include: { category: true, tags: true },
          orderBy,
          take,
          skip,
        }),
        model.count({ where }),
      ]);

      res.json({ items, total, page: Number(page), limit: take });
    },

    async getBySlug(req, res) {
      const item = await model.findUnique({
        where: { slug: req.params.slug },
        include: {
          category: true,
          tags: true,
          debateRoom: { select: { id: true } },
        },
      });
      if (!item) return res.status(404).json({ error: "Not found" });

      await model.update({ where: { id: item.id }, data: { views: { increment: 1 } } });
      res.json(item);
    },

    async create(req, res) {
      try {
        const body = { ...req.body };
        if (body.tags) {
          body.tagSlugs = Array.isArray(body.tags) ? body.tags : JSON.parse(body.tags);
        }

        let fileUrl = body[fileField];
        if (req.file) {
          fileUrl = await saveFile(req.file.buffer, req.file.originalname, uploadType);
        }
        if (!fileUrl) {
          return res.status(400).json({ error: `${fileField} is required (upload a file or provide a URL)` });
        }

        const baseSlug = slugify(body.title || "untitled", { lower: true, strict: true });
        let slug = baseSlug;
        let suffix = 1;
        while (await model.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${suffix++}`;
        }

        const data = {
          title: body.title,
          description: body.description,
          slug,
          [fileField]: fileUrl,
        };
        if (body.abstract) data.abstract = body.abstract;
        if (body.publicationDate) data.publicationDate = new Date(body.publicationDate);
        if (body.fileType) data.fileType = body.fileType;
        if (body.categoryId) data.category = { connect: { id: body.categoryId } };
        if (body.tagSlugs?.length) {
          data.tags = { connect: body.tagSlugs.map((id) => ({ id })) };
        }

        const created = await model.create({ data, include: { category: true, tags: true } });

        const contentType = modelName.toUpperCase();
        await ensureDebateRoom(created.id, contentType);

        res.status(201).json(created);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create content", detail: err.message });
      }
    },

    async update(req, res) {
      try {
        const { id } = req.params;
        const body = { ...req.body };
        const data = {};

        ["title", "description", "abstract", "fileType"].forEach((f) => {
          if (body[f] !== undefined) data[f] = body[f];
        });
        if (body.publicationDate) data.publicationDate = new Date(body.publicationDate);
        if (body.categoryId) data.category = { connect: { id: body.categoryId } };

        if (req.file) {
          const existing = await model.findUnique({ where: { id } });
          data[fileField] = await saveFile(req.file.buffer, req.file.originalname, uploadType);
          if (existing?.[fileField]) await deleteFile(existing[fileField]);
        }

        const updated = await model.update({ where: { id }, data, include: { category: true, tags: true } });
        res.json(updated);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update content", detail: err.message });
      }
    },

    async remove(req, res) {
      try {
        const { id } = req.params;
        const existing = await model.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "Not found" });

        await model.delete({ where: { id } });
        if (existing[fileField]) await deleteFile(existing[fileField]);
        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete content", detail: err.message });
      }
    },

    async recordDownload(req, res) {
      const { id } = req.params;
      const updated = await model.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      });
      res.json({ downloads: updated.downloads });
    },
  };
}

module.exports = { createContentController };
