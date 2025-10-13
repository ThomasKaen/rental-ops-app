# Changelog

## [0.2.0] - 2025-10-13
### Added
- **Sites module**
  - CRUD (create, edit, delete, search)
  - “Manage Units” button links to Units page
  - Consistent minimalist UI
- **Units module**
  - Linked directly to Sites (`/sites/{id}/units/`)
  - CRUD + Bulk Add feature (Unit 1…N)
  - Query param support (`?site_id=`)
- **Tasks module**
  - Rebuilt “New Task” modal with Site + Unit dropdowns
  - Automatic fetch of existing Sites/Units
  - Improved error handling for backend validation
- **Inventory module**
  - Stable CRUD operations with unified layout
  - Consistent design system and trailing-slash fix
- **Routing & Layout**
  - `App` now serves as layout component (with `<Outlet />`)
  - `/units` route registered and functional
  - “Manage Units” navigation fixed
- **Docker & Dev**
  - Updated Docker dev setup (api + web-dev)
  - Persistent SQLite volume confirmed

### Changed
- Unified design language across all modules (spacing, colors, modals)
- Standardized all API endpoints to end with `/` (no more 307 redirects)
- Replaced raw alerts with cleaner in-modal confirmations
- Simplified React structure (each module in `src/pages/`)

### Fixed
- 307 redirect loops from FastAPI endpoints
- React router 404 from missing `/units` route
- Form validation crashes on backend error responses

### Notes
- This release completes the **MVP integration phase**.
- Next version (v0.3.0) will focus on Dashboard + Maintenance scheduling.

---

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
