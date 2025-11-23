🧭 v0.5.0 – Authentication, Roles & Activity Feed

Theme: User Identity, Accountability, Event Tracking
This version turns the app from a single-user prototype into a multi-user operational platform.

⭐ 1. Authentication & Sessions

Add real user identity and secure access.

Backend (FastAPI)

 Add /auth/register (admin only)

 Add /auth/login → returns JWT

 Add /auth/refresh

 Add /auth/me for session persistence

 Password hashing (argon2id preferred)

 JWT signing keys + rotation support

 OAuth2-style “Bearer token” dependency for protected routes

 User table migration:

id

username

email (optional)

hashed_password

role (“admin”, “manager”, “staff”)

created_at

Frontend

 Login page (minimal UI first)

 Auth context provider

 Axios interceptor adds JWT automatically

 Remember-me token refresh

 Redirects for protected pages

⭐ 2. User Roles & Permissions

Introduce operational control.

Roles

Admin — full access

Manager — can edit tasks, sites, units

Staff — can only view & update tasks assigned to them, add comments

Enforcement

 Protect backend routes using role checks

 Conditional UI on frontend (buttons hide/show)

 Only admins can:

create sites

delete units

delete tasks

 Managers can:

assign tasks

change status

 Staff can:

add comments

upload attachments

update own tasks only

⭐ 3. Activity Feed (Global & Per-task)

Let every action create a log entry.

Backend

Add ActivityLog model:

id

task_id (nullable — global actions allowed)

user_id

type (status_change, comment, attachment, create_task, delete_task…)

metadata (JSON)

created_at

Logs automatically generated on:

Task creation

Status changes

Due date changes

Assignment changes

Comment added / deleted

Attachment added / deleted

Unit / site changes

Login / logout (optional)

Endpoints:

 /activity?limit=50

 /tasks/{id}/activity

Frontend:

 Global activity feed page

 Activity timeline on TaskDetail under Comments

⭐ 4. Task Notifications (Phase 1)

Simple non-real-time notifications.

Add:

 “My Tasks Due Today”

 “My Overdue Tasks”

 Notification badge in header

 Email notifications (if configured)

Phase 2 (real-time websocket) can be v0.6.0+.

⭐ 5. UX Improvements and Cleanup

Minor fixes and polish.

 Global loading spinner & toast system

 Unified error popup component

 Keyboard shortcuts (Enter to submit comment, etc.)

 Better date/time formatting (UTC-safe)

 Accessible color scheme for priorities

 “Back” button logic standardized everywhere

⭐ 6. Deployment & Infra

Improve reliability for multi-user use.

 Enable Cloud Run min-instances (cold start reduction)

 Add DATABASE_URL for Cloud SQL (future Postgres upgrade)

 Prepare staging environment (optional)

 Add build badges or GitHub Actions for deploy