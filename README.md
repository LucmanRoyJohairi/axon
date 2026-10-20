# Axon — Frontend

Next.js 14 App Router frontend for the AI Ticket System.
Currently runs with **mock data** — no backend needed to get started.

---

## Getting Started (do this first)

### 1. Install Node.js

If you don't have it yet:
- Download from https://nodejs.org (pick the LTS version)
- Verify it works: `node -v` and `npm -v` in your terminal

### 2. Install dependencies

Open your terminal, `cd` into this folder, then:

```bash
npm install
```

This reads `package.json` and downloads everything into `node_modules/`. Takes ~30 seconds.

### 3. Run the dev server

```bash
npm run dev
```

Open your browser to **http://localhost:3000**

You should see the dashboard with mock ticket data. That's it — you're running.

---

## What you're looking at

```
app/
├── (app)/               ← Route group — adds the sidebar layout
│   ├── layout.tsx       ← Sidebar wraps all pages inside here
│   ├── dashboard/
│   │   └── page.tsx     ← /dashboard — stats + recent tickets
│   └── tickets/
│       ├── page.tsx     ← /tickets — filterable list
│       └── [id]/
│           └── page.tsx ← /tickets/abc123 — ticket detail
├── login/
│   └── page.tsx         ← /login
├── layout.tsx           ← Root layout — fonts, global CSS
└── globals.css          ← Design tokens (colors, spacing)

components/
├── layout/
│   └── Sidebar.tsx      ← Left nav
└── (more components go here as you build)

lib/
├── api.ts               ← All API calls — mock now, real later
├── mock-data.ts         ← Fake tickets and stats
└── utils.ts             ← formatDate, statusClass, etc.

types/
└── index.ts             ← TypeScript types for Ticket, User, etc.
```

---

## How the mock → real switch works

All data fetching goes through `lib/api.ts`. At the top of that file:

```ts
const USE_MOCK = true   // ← flip to false when backend is running
```

That single flag controls everything. When you flip it:
- `getTickets()` calls `GET /api/v1/tickets` instead of returning mock data
- `createTicket()` calls `POST /api/v1/tickets`
- `login()` calls `POST /api/v1/auth/login`

You don't change any page or component code — only the flag.

---

## Key concepts to notice as you read the code

**Route Groups `(app)`**
The `(app)` folder name has parentheses — this is a Next.js route group.
It doesn't affect URLs. `/dashboard` is still `/dashboard`.
It just lets us wrap those pages in a shared layout (the sidebar).

**`'use client'` directive**
Pages that use `useState` or `useEffect` need this at the top.
Without it, Next.js tries to render them on the server, which can't use browser APIs.

**Loading states**
Every page fetches data in `useEffect` and shows a skeleton while loading.
This pattern is what you'll use with the real API too.

**TypeScript types**
All data shapes are defined in `types/index.ts`.
When you connect the real backend, the types should match the Pydantic schemas exactly.

---

## Development commands

```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Build for production
npm run type-check   # Check TypeScript without building
npm run lint         # Run ESLint
```

---
<!-- 
## What to build next (your milestones)

**This week — get comfortable:**
- [ ] Run `npm run dev` and explore the UI
- [ ] Read through `lib/api.ts` — understand the mock pattern
- [ ] Read `app/(app)/dashboard/page.tsx` — trace how stats flow from mock data to UI
- [ ] Try adding a new mock ticket in `lib/mock-data.ts` and see it appear

**Next week — wire up the backend:**
- [ ] Get FastAPI running locally (see backend README)
- [ ] Flip `USE_MOCK = false` in `lib/api.ts`
- [ ] Register a user at `http://localhost:8000/docs`
- [ ] Log in via the `/login` page and see real tickets

**Week after — add features:**
- [ ] Build the "Update Status" button on the ticket detail page
- [ ] Add pagination to the ticket list
- [ ] Show AI processing status with real-time polling -->
