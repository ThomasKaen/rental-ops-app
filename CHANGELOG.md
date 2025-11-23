# Changelog

## [0.4.0] - 2025-11-23
### Added
- **Task IO (Attachments + Comments)**
  - `/api/tasks/{id}/attachments` upload, list, delete
  - `/api/tasks/{id}/comments` add, list, delete
  - New React components:
    - `<TaskAttachments />`
    - Updated `<Comments />` using service-layer logic
  - Integrated into **Task Detail** page
- **Service Layer Refactor**
  - Added full `services/*` folder:
    - `tasks.ts`, `task_io.ts`, `sites.ts`, `units.ts`, `inventory.ts`, `summary.ts`, `maintenance.ts`
  - All pages updated to Axios-based services (no direct API calls inside components)
  - Strong typing across all modules
- **UI Consistency**
  - Unified Tailwind v4 layout across pages
  - Restored & completed UI kit: `Button`, `Card`, `Input`, `Label`, `Textarea`
  - Modal system standardized
- **Deployment**
  - Backend & frontend fully working on **Google Cloud Run**
  - Fixed Nginx proxy, Docker context, and missing build files

### Changed
- Rebuilt Sites, Units, Tasks, Inventory, Dashboard, Maintenance pages to use the new service architecture
- Cleaned up leftover code from early prototype phase
- Improved error handling and data refresh flows in Task Detail

### Fixed
- Missing exports between pages (e.g., CardDescription, getSite)
- Vite/Tailwind black-screen issues
- Task Detail crashes from undefined API bindings
- Docker ignore rules causing missing `nginx.conf` during build

### Notes
- This completes the **v0.4.0 Ops Reliability** milestone.
- Next: **v0.5.0 – Authentication, Roles, Activity Feed**, and more Task-level intelligence.

## [0.3.0] - 2025-10-21
### Added
- **Dashboard**
  - `/api/summary` KPIs (sites, units, open, overdue, due today/week)
  - `/api/summary/overdue` list for quick action
- **Maintenance Scheduler**
  - `/api/maintenance/preview` (with `within_days` support)
  - `/api/maintenance/materialize` (creates next occurrences and advances template)
  - New UI page: **Maintenance** (preview + generate)
- **Tasks**
  - Recurrence fields in **New Task** modal (`is_recurring`, `recurrence`, `recur_interval`)
- **DB Migration**
  - `app/scripts/migrate_v030.py` adds recurrence columns idempotently
- **Infra**
  - Unified API namespace under **`/api/*`**
  - Backend Docker: **Python 3.14-slim**, `pip check`, wheel-only installs
  - Frontend Docker: Node 22 build + Nginx proxy `/api → api:8000`

### Changed
- Axios-only data access (`lib/api`) across the app
- Timezone handling standardized on `datetime.now(timezone.utc)`
- Summary endpoint made pydantic-safe (no `RowMapping` in responses)
- Robust SQLModel counting helper (no `scalar_one()`)

### Fixed
- 404s from missing `/api` prefix
- React crash when rendering raw error objects
- Task query ordering & SQLite missing-column errors after upgrades

### Notes
- This completes the **“Maintenance Flow” MVP**.
- Next: **v0.4.0 Ops Reliability** (comments/activity log, attachments, digests, filters).

---

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
