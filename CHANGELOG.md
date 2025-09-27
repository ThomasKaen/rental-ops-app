# Changelog

## [0.1.0] - 2025-09-27
### Added
- Persistent SQLite database (tasks/comments/attachments survive rebuilds).
- Task management:
  - Create, view, update (status, assignee, due date), delete.
  - Overdue detection and highlighting.
- Comments:
  - Add (form-data & JSON supported).
  - Edit/delete existing comments.
- Attachments:
  - Upload via form-data.
  - List + link for download.
- React frontend:
  - Task list with filters.
  - Task detail view (status update, assign/unassign, due date save/clear).
  - Activity feed with comments + attachments.

### Notes
- Database persistence via `./backend/data/app.db`.
- For dev only: `sqlite`. Will migrate to Postgres + Alembic for v1.0.0.
