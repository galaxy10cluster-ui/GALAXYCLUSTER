# HK Singh Research Hub

**Full-stack research platform** with live debate rooms, file streaming, admin CMS, and analytics.

- Frontend: Next.js 14 + TypeScript + Tailwind + Framer Motion
- Backend: Express.js + Socket.io + Prisma ORM
- Database: PostgreSQL
- Storage: Local disk (swappable to S3/Cloudinary)
- Deployment: Vercel (frontend) + Railway (backend + Postgres)

---

## Local Development — Quick Start

### Prerequisites
- Node.js 18+
- Docker (for the local Postgres container) — or any Postgres instance

### 1. Clone and install

```bash
git clone <your-repo>
cd hk-singh-research-hub
npm run install:all
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env:
#   JWT_SECRET=<any long random string>
#   ADMIN_EMAIL=hk.singh@example.com
#   ADMIN_PASSWORD=<your chosen password>

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Leave defaults — they already point at localhost:4000
```

### 3. Start the database, run migrations, seed demo content

```bash
npm run db:setup
# This runs: docker compose up -d → prisma migrate dev → prisma seed
# Seeds the PJ-Orbit paper, both videos, audio, and slide deck as ready-to-view content
```

### 4. Start both servers

```bash
npm run dev
# Runs concurrently:
#   Backend API + Socket.io → http://localhost:4000
#   Next.js frontend        → http://localhost:3000
```

### 5. Visit the site

| URL | What |
|-----|------|
| http://localhost:3000 | Public website (hero, papers, videos, audio, documents) |
| http://localhost:3000/papers | Research papers listing with search/filter |
| http://localhost:3000/papers/pj-orbit-hypothesis-localized-spacetime-curvature | Full paper page with PDF viewer + debate room |
| http://localhost:3000/videos | Video listing |
| http://localhost:3000/audio | Audio listing |
| http://localhost:3000/admin/login | Admin panel login |

Admin credentials match what you set in `backend/.env`:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

---

## Deployment — Vercel + Railway

### Backend on Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub → select the repo.
3. Add a **Postgres** service to the same Railway project (1 click).
4. In your backend service's Variables tab, add:

```
DATABASE_URL=<Railway copies this automatically from the Postgres plugin>
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-vercel-app.vercel.app
JWT_SECRET=<long random string>
ADMIN_EMAIL=hk.singh@example.com
ADMIN_PASSWORD=<strong password>
STORAGE_DRIVER=local
```

5. Set the **Start Command** to: `node src/server.js`
6. Set **Root Directory** to: `backend`
7. After first deploy, open Railway shell and run:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```

> **Note on file uploads in production**: Local disk storage on Railway will reset between deploys. For persistent media, switch to Cloudinary:
> 1. Create a free Cloudinary account
> 2. Set `STORAGE_DRIVER=cloudinary` and add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Railway Variables
> 3. Implement the Cloudinary branch in `backend/src/utils/storage.js` using the `cloudinary` npm package

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
   NEXT_PUBLIC_SOCKET_URL=https://your-railway-backend.railway.app
   NEXTAUTH_URL=https://your-vercel-app.vercel.app
   NEXTAUTH_SECRET=<long random string>
   ```
4. Deploy. Vercel detects Next.js automatically.

### WebSocket note
Railway supports WebSockets natively. No extra configuration needed.

---

## Admin Panel

Visit `/admin/login` with your admin credentials to:

| Section | What you can do |
|---------|-----------------|
| **Dashboard** | Stats overview, 14-day engagement chart, top debaters leaderboard |
| **Papers / Videos / Audio / Documents** | Upload new content, delete existing, view all |
| **Debates** | Moderate by room ID — delete comments, pin comments, ban participants |
| **Analytics** | Top content by views/plays |
| **Settings** | Site name, subtitle, theme colors |

**AI summarization**: Open a paper's admin row → call `POST /api/papers/:id/summarize` (requires `ANTHROPIC_API_KEY` in backend `.env`). The summary is stored in the database and shown in the paper detail page.

---

## API Reference

All content endpoints follow the same pattern:

### Public
```
GET  /api/papers?q=&category=&sort=newest&page=1&limit=12
GET  /api/papers/:slug
POST /api/papers/:id/download        # increments counter

GET  /api/videos?...
GET  /api/videos/:slug
POST /api/videos/:id/like

GET  /api/audios?...
GET  /api/audios/:slug
POST /api/audios/:id/download

GET  /api/documents?...
GET  /api/documents/:slug
POST /api/documents/:id/download

GET  /api/debates/:roomId
GET  /api/debates/:roomId/comments?sort=newest&category=SUPPORT
POST /api/debates/:roomId/join       { displayName }
POST /api/debates/:roomId/comments   { authorName, content, category, parentId? }
POST /api/debates/comments/:id/attachments  (multipart/form-data, field: file)
POST /api/debates/comments/:id/vote  { direction: "up"|"down" }

GET  /api/search?q=
GET  /api/categories
GET  /api/tags
POST /api/newsletter                 { email }
POST /api/contact                    { name, email, message }
POST /api/bookmarks                  { sessionId, contentType, contentId }
GET  /api/bookmarks/:sessionId
GET  /api/analytics/leaderboard
```

### Admin only (requires `Authorization: Bearer <token>`)
```
POST /api/auth/login                 { email, password }
GET  /api/auth/me

POST /api/papers                     (multipart: file + title + description + abstract + publicationDate)
PUT  /api/papers/:id                 (multipart: optional new file + updated fields)
DELETE /api/papers/:id

# Same pattern for /api/videos, /api/audios, /api/documents

DELETE /api/debates/comments/:id
PATCH  /api/debates/comments/:id/pin { pinned: true|false }
POST   /api/debates/ban              { roomId, displayName }
DELETE /api/debates/ban/:ipHash

GET  /api/analytics/overview
GET  /api/analytics/popular
GET  /api/analytics/engagement

POST /api/categories                 { name }
DELETE /api/categories/:id
POST /api/tags                       { name }
DELETE /api/tags/:id

POST /api/papers/:id/summarize       # AI summary (requires ANTHROPIC_API_KEY)
```

---

## Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | client → server | `roomId: string` |
| `leave_room` | client → server | `roomId: string` |
| `typing` | client → server | `{ roomId, displayName }` |
| `new_comment` | server → clients | full comment object |
| `vote_update` | server → clients | `{ commentId, upvotes, downvotes }` |
| `comment_deleted` | server → clients | `{ commentId }` |
| `comment_pinned` | server → clients | `{ commentId, pinned }` |
| `user_typing` | server → clients | `{ displayName }` |

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Long random string |
| `JWT_EXPIRES_IN` | — | `7d` | Token expiry |
| `ADMIN_EMAIL` | ✅ | — | Seed creates this admin |
| `ADMIN_PASSWORD` | ✅ | — | Change before production |
| `PORT` | — | `4000` | Server port |
| `NODE_ENV` | — | `development` | |
| `FRONTEND_URL` | ✅ | `http://localhost:3000` | CORS origin |
| `STORAGE_DRIVER` | — | `local` | `local` \| `s3` \| `cloudinary` |
| `ANTHROPIC_API_KEY` | — | — | Enables AI paper summarization |
| `AWS_*` | — | — | Required if `STORAGE_DRIVER=s3` |
| `CLOUDINARY_*` | — | — | Required if `STORAGE_DRIVER=cloudinary` |

### Frontend (`frontend/.env.local`)
| Variable | Required | Default |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | `http://localhost:4000` |
| `NEXTAUTH_URL` | — | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | — | — |

---

## Project Structure

```
hk-singh-research-hub/
├── docker-compose.yml          # Local Postgres container
├── package.json                # Root scripts (install:all, dev, db:setup)
│
├── backend/
│   ├── src/
│   │   ├── server.js           # Express + Socket.io entry point
│   │   ├── routes/             # authRoutes, contentRoutes, debateRoutes, miscRoutes
│   │   ├── controllers/        # authController, contentController, debateController...
│   │   ├── middleware/         # auth (JWT), upload (multer + validation)
│   │   ├── sockets/            # debateSocket (Socket.io event handlers)
│   │   └── utils/              # prisma, storage, ipHash
│   ├── prisma/
│   │   ├── schema.prisma       # Full database schema (15 models)
│   │   └── seed.js             # Seeds PJ-Orbit demo content
│   └── uploads/                # Local file storage (papers, videos, audio, documents...)
│
└── frontend/
    ├── app/
    │   ├── layout.tsx           # Root layout (fonts, ThemeProvider)
    │   ├── (site)/
    │   │   ├── layout.tsx       # Navbar + Footer wrapper
    │   │   ├── page.tsx         # Homepage
    │   │   ├── papers/          # Listing + [slug] detail
    │   │   ├── videos/          # Listing + [slug] detail
    │   │   ├── audio/           # Listing + [slug] detail
    │   │   ├── documents/       # Listing + [slug] detail
    │   │   ├── about/
    │   │   └── contact/
    │   └── admin/
    │       ├── layout.tsx       # Admin sidebar + auth guard
    │       ├── login/
    │       ├── dashboard/       # Stats, engagement chart, leaderboard
    │       ├── content/         # Upload/delete all content types
    │       ├── debates/         # Moderation panel
    │       ├── analytics/       # Popular content
    │       └── settings/
    └── src/
        ├── components/          # All shared UI components
        │   ├── SpacetimeGrid.tsx    # Animated canvas hero visual
        │   ├── Hero.tsx
        │   ├── Navbar.tsx
        │   ├── ContentCard.tsx
        │   ├── ContentListing.tsx   # Generic search/filter listing
        │   ├── DebatePanel.tsx      # Live debate room (Socket.io)
        │   ├── DebateJoinGate.tsx
        │   ├── CommentComposer.tsx
        │   ├── CommentThread.tsx    # Threaded + voting
        │   ├── DownloadButton.tsx
        │   ├── LikeButton.tsx
        │   ├── GlobalSearch.tsx
        │   └── ...
        ├── hooks/
        │   └── useDebateSocket.ts   # Socket.io connection hook
        └── lib/
            ├── api.ts           # Fetch wrapper
            └── types.ts         # TypeScript interfaces
```

---

## Security Summary

- **Admin routes**: JWT Bearer token required, validated server-side on every request
- **File uploads**: MIME type whitelist + size limits (25MB papers, 500MB video) enforced before anything hits storage
- **Debate content**: XSS-sanitized with `sanitize-html` before storage
- **IP moderation**: Raw IPs never stored — only salted SHA-256 hash, used only for ban enforcement
- **Rate limiting**: Global 200 req/15min on all API routes; debate comments additionally limited to 10/min per IP
- **CORS**: Locked to `FRONTEND_URL` env variable

---

## Credits

Research content © H.K. Singh. All theoretical content is independent, speculative, and non-peer-reviewed.
Platform built with Next.js, Express, Prisma, Socket.io, Tailwind CSS, and Framer Motion.
