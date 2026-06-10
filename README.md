# Xelix

**A modern university schedule platform — weekly timetables, learning resources, student community, and admin tools in one PWA.**

Built by [Van De Cipher](https://github.com/vancipher)

---

## Overview

Xelix is a full-stack web application built for university students and administrators. It replaces scattered spreadsheets and chat messages with a single, always-up-to-date schedule hub — with realtime sync, bilingual support, and mobile-first design.

Students browse their group's weekly timetable, access course materials, react to events, leave comments, and mark tasks complete. Admins manage schedules, resources, users, and push notifications from a dedicated dashboard.

---

## Features

### For students
| Feature | Description |
|---|---|
| **Weekly schedule** | Per-group timetables (A, B, C, MA, MB, MC) across evening & morning sections |
| **Realtime updates** | Schedule changes sync instantly via Supabase Realtime |
| **Learning resources** | PDFs and video links organized by section and subject |
| **Event interactions** | Comments, reactions, and completion checklists per event |
| **User accounts** | Register, profile, and admin-approved access |
| **Bilingual UI** | Full Arabic / English support with RTL layout |
| **Themes** | Multiple visual themes (light, dark, nature, lavender, and more) |
| **PWA** | Installable progressive web app with offline-ready service worker |

### For administrators
| Feature | Description |
|---|---|
| **Schedule editor** | Add, edit, and delete events per group and day |
| **Resource manager** | Upload and organize course materials by subject |
| **User moderation** | Approve, ban, or remove student accounts |
| **Activity analytics** | Track user engagement and platform usage |
| **Push notifications** | Broadcast alerts to all subscribed devices |
| **Role-based access** | Super-admin and group-scoped admin permissions |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Framer Motion |
| Backend | Supabase (PostgreSQL + Realtime + Auth patterns) |
| Push API | Vercel serverless function (`api/send-push.js`) + Web Push |
| Styling | Custom CSS with theme system |
| i18n | Custom bilingual translation module |
| Deployment | Vercel (SPA + API routes) |
| PWA | `vite-plugin-pwa` + service worker |

---

## Architecture

```
Browser (React SPA)
      │
      ├── Supabase Client ──► PostgreSQL tables (schedule, resources, users, comments…)
      │                       └── Realtime channels (live schedule/resource sync)
      │
      └── Vercel API ──► /api/send-push ──► Web Push subscriptions
```

### Database tables (Supabase)

| Table | Purpose |
|---|---|
| `schedule` | Per-group timetable documents (JSON by day/events) |
| `resources` | Course materials by section and subject |
| `users` | Student accounts with approval and moderation state |
| `admins` | Admin credentials and group permissions |
| `comments` | Event-scoped discussion threads |
| `user_reactions` / `guest_reactions` | Per-event sentiment (logged-in or anonymous) |
| `event_completions` | User checklist state per schedule event |
| `visits` | Global visit counter |
| `push_subscriptions` | Browser push notification endpoints |

---

## Project structure

```
Xelix-Project/
├── src/
│   ├── components/
│   │   ├── Schedule/       Weekly timetable views
│   │   ├── Resources/      Learning materials browser + admin manager
│   │   ├── Auth/           Student login, register, profile, comments
│   │   ├── Admin/          Dashboard, user mgmt, activity, event forms
│   │   ├── Layout/         Header, footer, theme effects
│   │   └── UI/             Modal, notification bell
│   ├── contexts/           Auth, schedule, group, resources, language, theme
│   └── utils/              i18n, helpers, notifications
├── api/
│   └── send-push.js        Serverless web push broadcaster
├── public/                 PWA icons and static assets
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Quick start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with the required tables
- (Optional) Vercel account for deployment and push notifications

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Update `src/firebase.js` with your Supabase project URL and anon key, or migrate to environment variables:

```js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 3. Run locally

```bash
npm run dev
```

Open **http://localhost:5173**

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Environment variables (Vercel / push API)

Set these in your Vercel project dashboard for the push notification endpoint:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (server-side only) |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |
| `VAPID_EMAIL` | Contact email for VAPID |
| `PUSH_SECRET` | Shared secret for admin push requests |

---

## Deployment

Xelix is designed for **Vercel**:

```bash
npm run build
vercel --prod
```

`vercel.json` handles SPA routing — all non-API paths rewrite to `index.html`.

One-command deploy script:

```bash
npm run ship
```

---

## User groups

| Section | Groups |
|---|---|
| Evening | A, B, C |
| Morning | MA, MB, MC |

Each group has its own independent schedule document synced in realtime.

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
| `/admin` | Admin | Dashboard |
| `/admin/manage` | Admin | Schedule management |
| `/admin/resources` | Admin | Resource management |
| `/admin/users` | Admin | User moderation |
| `/admin/activity` | Admin | Activity analytics |

---

## License

Private project — contact the maintainer for usage inquiries.

---

<p align="center">
  <strong>Xelix</strong> — your academic week, always in sync.
</p>
