# ⚡ Axon — AI-Powered Support Ticket Triage

> A modern, dark-mode support ticket dashboard and triage interface built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **Supabase**, and **FastAPI**.

---

## ✨ Features

- **📊 Real-Time Triage Dashboard**
  - Live queue metrics (*Total*, *Open*, *In Progress*, and *AI Processed* tickets).
  - Visual priority (`Critical`, `High`, `Medium`, `Low`) and category (`Bug`, `Feature`, `Billing`, `Support`, `Other`) breakdown charts.
  - Recent tickets feed with inline AI summaries and processing indicators.

- **🤖 FastAPI AI Triage Integration**
  - Asynchronous background triage pipeline powered by **FastAPI** + LLM classification (Claude).
  - Automatically summarizes ticket descriptions and assigns `ai_category` and `ai_priority` while tracking `ai_processed` status in Supabase.
  - Sidebar worker status indicator (`AI Worker Offline / Standby` vs. `AI Triage Active`).

- **🎫 Ticket Management & Filtering**
  - Filterable ticket queue by **Status**, **Priority**, and **Category**.
  - Detailed ticket inspection view with AI triage summary cards, metadata sidebar, timeline tracking, and one-click status updates (*Open*, *In Progress*, *Resolved*).
  - **Create Ticket Dialog** supporting automatic AI triage or optional manual category/priority overrides.

- **🔐 Flexible Authentication & Local Sandbox**
  - **Email & Password Sign-In** backed by `@supabase/ssr` cookie sessions and route protection (`middleware.ts`).
  - **Anonymous Guest Sessions** (`signInAnonymously`) for frictionless demos.
  - **Local Development Bypass** (`NEXT_PUBLIC_DEV_BYPASS_AUTH=true`) paired with an interactive `sessionStorage` mock-data sandbox and one-click **Reset Demo Data**.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **UI & Language** | [React 19](https://react.dev) & TypeScript |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) (`@theme inline`) |
| **Component Primitives** | [shadcn/ui](https://shadcn.com) (Base UI primitives) |
| **Backend & AI Worker** | [FastAPI](https://tiangolo.com) (Python REST API & background triage worker) |
| **Auth & Database** | [Supabase](https://supabase.com) (PostgreSQL, `@supabase/ssr`, `@supabase/supabase-js`) |

---

## 🏗️ System Architecture

```text
┌─────────────────────┐        Auth & Queries        ┌─────────────────────┐
│   Next.js Frontend  │ ◄──────────────────────────► │      Supabase       │
│  (App Router + UI)  │                              │ (Auth + PostgreSQL) │
└──────────┬──────────┘                              └──────────▲──────────┘
           │                                                    │
           │ REST API (/api/v1)                                 │ Updates AI fields
           ▼                                                    │ (`ai_summary`,
┌─────────────────────┐                                         │  `ai_priority`,
│   FastAPI Backend   │ ────────────────────────────────────────┘  `ai_category`)
│  (AI Triage Worker) │
└─────────────────────┘
```

---

## 📁 Project Structure

```text
triage-frontend/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx       # Analytics overview, stat cards & breakdown charts
│   │   ├── tickets/
│   │   │   ├── page.tsx             # Filterable ticket queue & creation trigger
│   │   │   └── [id]/page.tsx        # Single ticket view, AI triage card & status actions
│   │   └── layout.tsx               # Authenticated shell with fixed Sidebar
│   ├── login/page.tsx               # Email/password, Guest & Local Dev Mode login
│   ├── globals.css                  # Tailwind v4 theme tokens & custom dark palette
│   ├── layout.tsx                   # Root HTML/Body & Google Fonts (DM Sans, Inter, DM Mono)
│   └── page.tsx                     # Root redirect to /dashboard
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # Navigation shell, live queue counts & user footer
│   │   ├── SidebarNav.tsx           # Workspace links, queue quick-views & AI worker status
│   │   └── SignOutDialog.tsx        # Session sign-out confirmation modal
│   ├── tickets/
│   │   ├── CreateTicketDialog.tsx   # Modal form with optional manual priority/category
│   │   ├── RecentTicketsTable.tsx   # Dashboard recent tickets card
│   │   ├── TicketAiCard.tsx         # AI summary & classification card
│   │   ├── TicketFilters.tsx        # Status, priority & category filter bar
│   │   ├── TicketRow.tsx            # Reusable ticket list item
│   │   └── TicketSidebar.tsx        # Detail metadata, timeline & status update actions
│   └── ui/                          # shadcn/ui primitives & custom dashboard skeletons
├── lib/
│   ├── api.ts                       # FastAPI REST client (`/api/v1` endpoints)
│   ├── mock-data.ts                 # Relative-timestamp sample tickets for sandbox mode
│   ├── tickets.ts                   # Unified data layer (Supabase + Guest/Dev sandbox)
│   └── utils.ts                     # `cn()` helper, date formatters & badge class maps
├── types/
│   └── index.ts                     # Core TypeScript interfaces (`Ticket`, `DashboardStats`)
├── utils/supabase/
│   ├── client.ts                    # Browser Supabase client
│   └── server.ts                    # Server SSR Supabase client
└── middleware.ts                    # Session validation & route protection
```

---

## 🌐 Live Demo
Try it live at **[axon-ticketing-system-two.vercel.app](https://axon-ticketing-system-two.vercel.app)** — click **Continue as Guest** on the login screen to explore the interactive sandbox.

## 🚀 Local Setup
```bash
git clone https://github.com
cd axon && npm install
cp .env.local.example .env.local
npm run dev
```

---

## 🔌 FastAPI Backend Endpoints (`/api/v1`)

The frontend client (`lib/api.ts`) is structured to communicate with the following FastAPI routes:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user and return access token |
| `GET` | `/api/v1/tickets` | List tickets with optional `status`, `priority`, and `category` filters |
| `GET` | `/api/v1/tickets/{id}` | Retrieve full details and AI triage output for a single ticket |
| `POST` | `/api/v1/tickets` | Create a new ticket and enqueue it for AI classification |
| `GET` | `/api/v1/tickets/stats` | Fetch aggregate ticket counts and priority/category breakdowns |

---

## 🗄️ Supabase Table Schema (`tickets`)

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key (`gen_random_uuid()`) |
| `title` | `text` | Ticket subject |
| `description` | `text` | Detailed issue description |
| `status` | `text` | `'open' \| 'in_progress' \| 'resolved' \| 'closed'` |
| `priority` | `text` | `'pending' \| 'low' \| 'medium' \| 'high' \| 'critical'` |
| `category` | `text` | `'bug' \| 'feature' \| 'billing' \| 'support' \| 'other'` |
| `ai_summary` | `text` | Nullable — populated by FastAPI AI triage worker |
| `ai_category` | `text` | Nullable — AI-suggested category |
| `ai_priority` | `text` | Nullable — AI-suggested priority |
| `ai_processed` | `boolean` | Defaults to `false` until processed by AI worker |
| `creator_id` | `uuid` | References `auth.users(id)` |
| `assignee_id` | `uuid` | Nullable — assigned agent ID |
| `created_at` | `timestamptz` | Defaults to `now()` |
| `updated_at` | `timestamptz` | Defaults to `now()` |

---

## 🗺️ Roadmap

- [x] Next.js 16 + Tailwind CSS v4 + shadcn/ui dark-amber design system
- [x] Supabase SSR authentication, guest mode & local dev sandbox
- [x] Ticket creation, multi-criteria filtering & live status updates
- [ ] Deploy FastAPI + LLM background worker for automated ticket triage
- [ ] Real-time Supabase subscriptions for live AI triage updates without page refresh

---

## 📄 License

This project is licensed under the **MIT License**.
