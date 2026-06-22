// src/controllers/taxonomyController.js
const prisma = require("../utils/prisma");
const slugify = require("slugify");

async function listCategories(req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}

async function createCategory(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const slug = slugify(name, { lower: true, strict: true });
  const category = await prisma.category.create({ data: { name, slug } });
  res.status(201).json(category);
}

async function deleteCategory(req, res) {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}

async function listTags(req, res) {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  res.json(tags);
}

async function createTag(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const slug = slugify(name, { lower: true, strict: true });
  const tag = await prisma.tag.create({ data: { name, slug } });
  res.status(201).json(tag);
}

async function deleteTag(req, res) {
  await prisma.tag.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}

module.exports = {
  listCategories,
  createCategory,
  deleteCategory,
  listTags,
  createTag,
  deleteTag,
};
