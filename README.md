# Inventory & Task Tracker (v0.1.0)

A lightweight task + inventory management system with FastAPI (backend) and React/TypeScript (frontend).

## ✨ Features
- Task CRUD (create, edit, assign, due date, delete).
- Comment system (add, edit, delete).
- File attachments per task.
- React frontend with filters, task detail, activity feed.
- Persistent SQLite database (survives Docker rebuilds).

## 🚀 Tech Stack
- **Backend:** FastAPI + SQLModel + SQLite (dev mode).
- **Frontend:** React + TypeScript + Vite.
- **Runtime:** Docker / Docker Compose.

## 🛠 Development
- bash
docker compose up --build

The API runs at http://localhost:8000.
Frontend runs at http://localhost:3000 (if using web service with Node).

Database

Default: sqlite:////app/data/app.db (mounted at ./backend/data/app.db).

Do not run docker compose down -v unless you want to erase all data.

🔮 Roadmap

v0.2.0: Sites & Units CRUD, Inventory stock & movements.

v0.3.0: Authentication, notifications, UX polish.

v1.0.0: Postgres + Alembic migrations, deployment-ready.

📜 License

Licensed under the Prosperity Public License
 — same model as NAS File Organizer project.

Free for personal & non-commercial use.

Commercial use requires purchasing a license.

After a time/revenue milestone, transitions to open-source.
