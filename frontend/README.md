# 🚀 DevHire Lite

A lightweight job portal MVP where **candidates** can search and apply for jobs, and **recruiters** can post openings.

## 📸 Preview

_(Screenshots coming after Phase 1 completes)_

## 🛠️ Tech Stack

**Frontend (Phase 1):**
- HTML5, CSS3, Vanilla JS (ES6+)
- Tailwind CSS (via CDN)

**Coming in later phases:**
- React + TypeScript + Zustand + React Router
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- Redis
- JWT Auth

## 📂 Project Structure

```
devhire-lite/
├── frontend/
│   ├── index.html          # Home
│   ├── jobs.html           # Jobs list with filters
│   ├── job-detail.html     # Single job view
│   ├── login.html          # Login
│   ├── register.html       # Register
│   ├── dashboard.html      # Candidate / Recruiter dashboard
│   ├── css/styles.css
│   └── js/
│       ├── main.js         # Shared (nav, toast, mock data)
│       ├── jobs.js         # Jobs page logic
│       ├── job-detail.js   # Job detail logic
│       └── auth.js         # Login/Register validation
├── .gitignore
└── README.md
```

## 🚦 How to Run

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd devhire-lite
   ```
2. Open `frontend/index.html` in your browser (or use VS Code Live Server).

## 🎯 Features (Phase 1)

- ✅ Responsive home page with hero + featured jobs
- ✅ Jobs listing with search, filters, sort, pagination
- ✅ Job detail page with dynamic content from URL
- ✅ Login / Register forms with client-side validation
- ✅ Dashboard with Candidate / Recruiter tab views
- ✅ Accessible (ARIA labels, skip-links, keyboard nav)
- ✅ Mobile-first responsive design

## 📅 Roadmap

- [x] Phase 1 — Static UI
- [ ] Phase 2 — React + TypeScript
- [ ] Phase 3 — Zustand + Backend start
- [ ] Phase 4 — Auth + CRUD APIs
- [ ] Phase 5 — Redis + Performance
- [ ] Phase 6 — Testing + Polish
- [ ] Phase 7 — Deploy

## 👤 Author

**Rashi** — [GitHub](https://github.com/TUMHARA_USERNAME)

## 📄 License

MIT