# After Break (Xelix)

**Version 2.0** — A production-ready university schedule PWA for students and administrators.

[![Live App](https://img.shields.io/badge/Live-xelix--project.vercel.app-purple?style=for-the-badge)](https://xelix-project.vercel.app/)
[![Version](https://img.shields.io/badge/v2.0-After%20Break-orange?style=flat-square)](https://xelix-project.vercel.app/)
[![PWA](https://img.shields.io/badge/PWA-Installable-blue?style=flat-square)](https://xelix-project.vercel.app/)

Built by [Van De Cipher](https://github.com/vancipher) · **[Open the live app →](https://xelix-project.vercel.app/)**

---

## What is After Break?

After Break is a bilingual (Arabic / English) web application that centralizes the academic week: group schedules, course resources, student engagement, and admin operations — delivered as an installable progressive web app with realtime sync.

It is designed for institutions that need a mobile-first schedule hub without relying on scattered spreadsheets or chat threads.

---

## What’s new in v2.0

Version 2.0 is a major product and UX refresh. The focus is clarity, speed of admin workflows, and a cohesive mobile interface.

### Interface & navigation
- **Fluid bottom dock** — full-width abstract nav bar with a center floating action button (schedule), animated active indicator, and safe-area support
- **Reorganized More menu** — grouped Workspace / Management sections, iconized links, and a dedicated account card (no confusing Sign In while already authenticated)
- **Profile entry points** — admin shield icon and student user icon in the header, both open the correct profile route
- **Theme-aware chrome** — upward fade blur behind the dock on high-impact themes; polished glass sheets for theme and more menus

### Admin experience
- **Sliding section & group controls** — evening/morning and A/B/C switches match the public schedule UI
- **Enhanced event composer** — compact modal layout, typed event chips with icons, accent-aware toggles, sticky actions, and validation without page scroll noise
- **Arabic-first publishing** — admins write titles in Arabic; After Break auto-translates to English for bilingual display
- **Resource Manager overhaul** — equal PDF/YouTube type track, empty states with guidance, subject cards with badges/counts, and the same Arabic-first + translate flow

### Reliability & polish
- **Dev-friendly PWA updates** — service worker registration skipped in local development to avoid stale caches
- **More resilient Vite watch** — polling enabled for OneDrive / synced folders
- **Copy & i18n refinements** — corrected Arabic tagline, clearer admin labels (e.g. تعديل الجدول)

---

## Main features

### Students
| Feature | Description |
|---|---|
| **Weekly schedule** | Timetables by evening/morning section and group (A–C / MA–MC) |
| **Realtime sync** | Schedule and resource updates via Supabase Realtime |
| **Resources** | PDFs and YouTube materials organized by subject |
| **Engagement** | Reactions, comments, and completion checkmarks per event |
| **Accounts** | Register, login, and admin-approved student profiles |
| **Bilingual UI** | Full AR / EN with RTL layout |
| **Themes** | Multiple visual themes (light, dark, nature, lavender, and more) |
| **PWA** | Installable app shell with background update checks |

### Administrators
| Feature | Description |
|---|---|
| **Schedule dashboard** | Create and edit events per day, group, and section |
| **Smart event form** | Type chips, recurring / important toggles, auto EN titles |
| **Resource manager** | Subjects + PDF/video items with Arabic-first input |
| **User moderation** | Approve, ban, or remove student accounts |
| **Admin management** | Super-admin tools for admin accounts and scopes |
| **Activity insights** | Engagement overview across users |
| **Push notifications** | Broadcast reminders to subscribed devices |
| **Role-based access** | Super-admin vs group-scoped permissions |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Framer Motion |
| Backend | Supabase (PostgreSQL + Realtime) |
| Push | Vercel serverless (`api/send-push.js`) + Web Push |
| Styling | Custom CSS design system with theme tokens |
| i18n | Custom bilingual module |
| PWA | `vite-plugin-pwa` + injectManifest service worker |
| Deploy | Vercel (SPA rewrites + API routes) |

---

## Architecture

```
Browser (React SPA / PWA)
      │
      ├── Supabase Client ──► PostgreSQL (schedule, resources, users, comments…)
      │                       └── Realtime channels
      │
      └── Vercel API ──► /api/send-push ──► Web Push subscriptions
```

### Core tables

| Table | Purpose |
|---|---|
| `schedule` | Per-group timetable documents |
| `resources` | Course materials by section / subject |
| `users` | Student accounts and moderation state |
| `admins` | Admin credentials and permissions |
| `comments` | Event discussion threads |
| `user_reactions` / `guest_reactions` | Per-event reactions |
| `event_completions` | Completion checklist state |
| `visits` | Visit counter |
| `push_subscriptions` | Push endpoints |

---

## Project structure

```
Xelix-Project/
├── src/
│   ├── components/
│   │   ├── Schedule/       Weekly timetable
│   │   ├── Resources/      Public browser + admin Resource Manager
│   │   ├── Auth/           Student auth, profile, comments
│   │   ├── Admin/          Dashboard, event form, users, activity
│   │   ├── Layout/         Header dock, more sheet, footer
│   │   └── UI/             Modal, notification bell
│   ├── contexts/           Auth, schedule, group, resources, language, theme
│   └── utils/              i18n, helpers, translate, bottomNavPath, PWA updates
├── api/
│   └── send-push.js
├── public/
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Quick start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with the required tables
- (Optional) Vercel for production deploy and push

### Install & run

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

### Production build

```bash
npm run build
npm run preview
```

Configure Supabase via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).

---

## Environment variables (Vercel / push)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (server only) |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |
| `VAPID_EMAIL` | VAPID contact email |
| `PUSH_SECRET` | Shared secret for admin push requests |

---

## Deployment

**Live:** [https://xelix-project.vercel.app/](https://xelix-project.vercel.app/)

```bash
npm run build
vercel --prod
```

Or:

```bash
npm run ship
```

`vercel.json` rewrites non-API routes to `index.html` for SPA routing.

---

## Academic groups

| Section | Groups |
|---|---|
| Evening | A, B, C |
| Morning | MA, MB, MC |

Each group has an independent schedule document synced in realtime.

---

## Routes

| Path | Access | Page |
|---|---|---|
| `/` | Public | Weekly schedule |
| `/resources` | Public | Learning materials |
| `/login` | Public | Student login |
| `/register` | Public | Student registration |
| `/profile` | Student | User profile |
| `/admin/login` | Public | Admin login |
| `/admin` | Admin | Schedule dashboard |
| `/admin/resources` | Admin | Resource management |
| `/admin/profile` | Admin | Admin profile |
| `/admin/manage` | Super-admin | Admin management |
| `/admin/users` | Admin | User moderation |
| `/admin/activity` | Admin | Activity analytics |

---

## License

**Van Cipher Restricted License v1.0** — see [LICENSE](LICENSE).

You may read this repository for learning. **Deploying After Break / Xelix for any institution or commercial use requires written permission** from [Abdullah Y. Habash (@vancipher)](https://github.com/vancipher).

---

<p align="center">
  <strong>After Break v2.0</strong> — organize the academic week, remind what gets forgotten.
</p>
