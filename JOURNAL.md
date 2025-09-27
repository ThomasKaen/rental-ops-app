# Project Journal

## 2025-09-27 — v0.1.0 Complete 🎉
- Finished MVP milestone.
- SQLite persistence confirmed (no more data resets on rebuild).
- Task CRUD (status, assignee, due date, delete).
- Comment system working (add/edit/delete, JSON + form-data).
- Attachments integrated (upload + download).
- React frontend wired up with task list, filters, task detail, activity feed.
- Declared official release: **v0.1.0**.

Reflections:
- SQLite + bind mount was enough to speed dev.
- Will need Postgres + Alembic migrations before production.
- React UI clean but needs polish (task editing, better attachment previews).
- This version feels like a “usable sandbox” → real workflows possible now.

Next milestones:
- Sites/Units CRUD → scope tasks & inventory.
- Inventory CRUD + stock movements.
- Authentication layer before broader testing.