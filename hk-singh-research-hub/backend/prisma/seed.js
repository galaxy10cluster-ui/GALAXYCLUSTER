// prisma/seed.js
//
// Run with: npm run seed (after migrations have been applied)
// Creates the initial admin login, taxonomy, and pre-loads H.K. Singh's
// actual PJ-Orbit Hypothesis materials as demo content with working debate
// rooms already attached.

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding HK Singh Research Hub...");

  // ── Admin account ──
  const adminEmail = process.env.ADMIN_EMAIL || "hk.singh@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "H K Singh",
      email: adminEmail,
      passwordHash,
      role: "Owner / Research Publisher",
    },
  });
  console.log(`Admin account ready: ${adminEmail}`);

  // ── Site settings ──
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  // ── Categories ──
  const categoryNames = [
    "Theoretical Physics",
    "Cosmology",
    "Gravitational Theory",
    "Negative Mass Research",
  ];
  const categories = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    categories[name] = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  // ── Tags ──
  const tagNames = [
    "negative-mass",
    "spacetime-curvature",
    "anti-gravity",
    "dark-matter-alternative",
    "galactic-rotation",
    "general-relativity",
    "speculative-physics",
  ];
  const tags = {};
  for (const name of tagNames) {
    tags[name] = await prisma.tag.upsert({
      where: { slug: name },
      update: {},
      create: { name: name.replace(/-/g, " "), slug: name },
    });
  }

  // ── Research Paper ──
  const paper = await prisma.paper.upsert({
    where: { slug: "pj-orbit-hypothesis-localized-spacetime-curvature" },
    update: {},
    create: {
      title: "PJ-Orbit Hypothesis: A Localized Spacetime Curvature Model for Negative Mass",
      slug: "pj-orbit-hypothesis-localized-spacetime-curvature",
      description:
        "A theoretical framework proposing that negative mass is confined within localized spacetime curvature structures, introducing the 'PJ-orbit' — a bounded equilibrium region where gravity transitions from repulsive to attractive — as an alternative explanation for galactic rotation anomalies and ring structures.",
      abstract:
        "This paper develops and extends the PJ-orbit hypothesis, a localized spacetime curvature model designed to describe interactions involving negative mass. Building upon modifications of Einstein's field equations, this framework introduces a bounded equilibrium region termed the PJ-orbit where gravitational interaction transitions from repulsive to attractive behavior. The framework aims to reconcile the absence of large-scale observable negative mass effects while providing explanations for galactic rotation anomalies, ring structures, and localized gravitational irregularities.",
      fileUrl: "/uploads/papers/pj-orbit-hypothesis-research-paper.pdf",
      thumbnailUrl: "/uploads/images/pj-orbit-topographical-inversion-diagram.jpeg",
      publicationDate: new Date("2026-06-21"),
      authorName: "H K Singh",
      categoryId: categories["Theoretical Physics"].id,
      tags: {
        connect: [
          { id: tags["negative-mass"].id },
          { id: tags["spacetime-curvature"].id },
          { id: tags["anti-gravity"].id },
          { id: tags["dark-matter-alternative"].id },
          { id: tags["general-relativity"].id },
          { id: tags["speculative-physics"].id },
        ],
      },
    },
  });
  await prisma.debateRoom.upsert({
    where: { paperId: paper.id },
    update: {},
    create: { contentType: "PAPER", paperId: paper.id },
  });
  console.log("Seeded research paper + debate room");

  // ── Videos ──
  const video1 = await prisma.video.upsert({
    where: { slug: "pj-orbit-overview-simplified" },
    update: {},
    create: {
      title: "PJ-Orbit Hypothesis — Simplified Overview",
      slug: "pj-orbit-overview-simplified",
      description:
        "An accessible introduction to the PJ-Orbit hypothesis: how negative mass could be confined within a stable spacetime boundary instead of causing runaway motion, and what that means for galactic rotation curves.",
      fileUrl: "/uploads/videos/pj-orbit-overview-simplified.mp4",
      thumbnailUrl: "/uploads/images/pj-orbit-antigravity-distance-diagram.jpeg",
      categoryId: categories["Cosmology"].id,
      tags: { connect: [{ id: tags["negative-mass"].id }, { id: tags["anti-gravity"].id }] },
    },
  });
  await prisma.debateRoom.upsert({
    where: { videoId: video1.id },
    update: {},
    create: { contentType: "VIDEO", videoId: video1.id },
  });

  const video2 = await prisma.video.upsert({
    where: { slug: "pj-orbit-overview-descriptive-depth" },
    update: {},
    create: {
      title: "PJ-Orbit Hypothesis — Descriptive Depth Overview",
      slug: "pj-orbit-overview-descriptive-depth",
      description:
        "A deeper walkthrough of the mathematical framework behind the PJ-orbit model, covering the modified effective acceleration equation, the tanh-based transition function, and comparisons with the dark matter hypothesis.",
      fileUrl: "/uploads/videos/pj-orbit-overview-descriptive-depth.mp4",
      thumbnailUrl: "/uploads/images/pj-orbit-effective-acceleration-diagram.jpeg",
      categoryId: categories["Gravitational Theory"].id,
      tags: {
        connect: [{ id: tags["spacetime-curvature"].id }, { id: tags["general-relativity"].id }],
      },
    },
  });
  await prisma.debateRoom.upsert({
    where: { videoId: video2.id },
    update: {},
    create: { contentType: "VIDEO", videoId: video2.id },
  });
  console.log("Seeded 2 videos + debate rooms");

  // ── Audio ──
  const audio = await prisma.audio.upsert({
    where: { slug: "pj-orbit-audio-overview" },
    update: {},
    create: {
      title: "Audio Overview of the PJ-Orbit Hypothesis",
      slug: "pj-orbit-audio-overview",
      description:
        "A spoken-format discussion of the PJ-orbit hypothesis, covering the core ideas of negative mass confinement, the runaway motion paradox, and how this model compares to conventional dark matter explanations.",
      fileUrl: "/uploads/audio/pj-orbit-audio-overview.m4a",
      categoryId: categories["Negative Mass Research"].id,
      tags: { connect: [{ id: tags["negative-mass"].id }, { id: tags["galactic-rotation"].id }] },
    },
  });
  await prisma.debateRoom.upsert({
    where: { audioId: audio.id },
    update: {},
    create: { contentType: "AUDIO", audioId: audio.id },
  });
  console.log("Seeded audio + debate room");

  // ── Document (slide deck) ──
  const document = await prisma.document.upsert({
    where: { slug: "pj-orbit-visualization-slide-deck" },
    update: {},
    create: {
      title: "PJ-Orbit Hypothesis — Visualization Slide Deck",
      slug: "pj-orbit-visualization-slide-deck",
      description:
        "A 13-slide visual explainer covering the counter-intuitive dynamics of negative mass, the runaway motion paradox, the spatial confinement hypothesis, and macroscopic astrophysical signatures predicted by the PJ-orbit model.",
      fileUrl: "/uploads/documents/pj-orbit-visualization-slide-deck.pdf",
      fileType: "pdf",
      categoryId: categories["Cosmology"].id,
      tags: { connect: [{ id: tags["dark-matter-alternative"].id }, { id: tags["galactic-rotation"].id }] },
    },
  });
  await prisma.debateRoom.upsert({
    where: { documentId: document.id },
    update: {},
    create: { contentType: "DOCUMENT", documentId: document.id },
  });
  console.log("Seeded document + debate room");

  // ── Sample debate comments (so demo rooms aren't empty) ──
  const room = await prisma.debateRoom.findUnique({ where: { paperId: paper.id } });
  const sampleComments = [
    {
      authorName: "A. Researcher",
      content:
        "The tanh transition function is an elegant way to avoid a hard discontinuity at r_PJ — has this been checked against any known galactic rotation curve datasets yet?",
      category: "QUESTION",
    },
    {
      authorName: "Physics_Skeptic",
      content:
        "Promising direction, but I'd want to see how this holds up against CMB constraints before treating it as a serious dark matter alternative. The paper itself flags this limitation, which is good practice.",
      category: "OPPOSITION",
    },
    {
      authorName: "GradStudent_K",
      content:
        "Appreciate that this is presented as an early-stage hypothesis rather than a finished theory. The spatial confinement idea for resolving the runaway motion paradox is a genuinely interesting angle.",
      category: "SUPPORT",
    },
  ];
  for (const c of sampleComments) {
    await prisma.comment.create({
      data: {
        debateRoomId: room.id,
        authorName: c.authorName,
        ipHash: "seed-placeholder-hash",
        content: c.content,
        category: c.category,
      },
    });
  }
  console.log("Seeded sample debate comments");

  console.log("\nSeed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Change ADMIN_PASSWORD in .env before deploying to production.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
