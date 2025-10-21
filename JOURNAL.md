# Project Journal

## 2025-10-21 — v0.3.0 Complete ✅
- Dashboard online with real KPIs + overdue list.
- Recurring maintenance engine wired end-to-end (preview + generate).
- Task creation supports recurrence; scheduler page added.
- `/api` namespace enforced; Axios-only client; UTC datetimes everywhere.
- Docker updated (Py 3.14, Node 22, Nginx proxy).

Reflections:
- Alignment work (prefixes, UTC, Axios) eliminated a lot of silent 404s / crashes.
- Lightweight SQLite migration script was enough; no Alembic needed yet.
- Codebase feels consistent and ready for daily use.

Next:
- v0.4.0 “Ops Reliability”: comments/activity log, attachments, daily digests, task filters.

---

## 2025-10-13 — v0.2.0 Complete 🚀
- Reached full MVP state — Sites, Units, Tasks, and Inventory all connected.
- Created new **Units module** with bulk add and per-site linking.
- Rebuilt **Sites page** with consistent UI and "Manage Units" integration.
- Reworked **Tasks modal** to use dropdown selectors for existing Sites/Units.
- Fixed routing — `/units` route now functional and properly nested.
- Unified layout and colors across all pages.
- Fixed all redirect loops by normalizing API endpoints with trailing `/`.

Reflections:
- The system finally feels cohesive — not just separate features.
- Adding new sites/units and assigning tasks to them works end-to-end.
- SQLite persistence continues to hold strong through Docker rebuilds.
- This version feels like a **true operational MVP**: ready for test runs and real workflows.

Next milestones:
- v0.3.0 → Dashboard with totals & task charts.
- v0.3.0 → Maintenance scheduling + recurring tasks.
- v1.0.0 → Authentication + migration to Postgres + refined UI polish.


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
