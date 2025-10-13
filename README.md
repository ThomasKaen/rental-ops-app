# Rental Ops App

**A full-stack property operations tool for managing tasks, sites, units, and inventory.**

# v0.2.0 — MVP Integration Release

Rental Ops has reached its first complete operational milestone — you can now manage properties (Sites), their Units, related Tasks, and Inventory in one cohesive workflow.

---

## ✨ Features

### 🏠 Sites
- CRUD with search and metadata (unit count)
- “Manage Units” deep-link button
- Clean unified interface

### 🏢 Units
- Linked directly to Sites (`/sites/{id}/units/`)
- Create, edit, delete units
- Bulk Add utility (Unit 1…N)
- Query param support (`?site_id=123` auto-selects)

### 📋 Tasks
- CRUD with improved modal
- Select existing Site + Unit (no manual IDs)
- Priority, due date, description, validation
- Readable backend error display

### 📦 Inventory
- Manage items + stock per Site
- CRUD for items and quantities
- Matches unified UI layout

---

## 🧭 Project Structure
frontend/
src/pages/
Sites.tsx
Units.tsx
Tasks.tsx
Inventory.tsx
backend/
app/
routers/
sites.py
units.py
tasks.py
inventory.py
docker-compose.yml

yaml
Copy code

---

## 🚀 Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React + TypeScript + Vite |
| **Backend** | FastAPI + SQLModel |
| **Database** | SQLite (persistent via Docker volume) |
| **Infra** | Docker Compose (api + web-dev) |

---

## 🛠 Development
```bash
docker compose up --build
API: http://localhost:8000

Frontend (dev): http://localhost:5173

To rebuild without wiping data, do not use docker compose down -v.

Database file lives at:

bash
Copy code
backend/data/app.db
🔮 Roadmap
v0.3.0 – Maintenance & Dashboard

Dashboard KPIs (Sites / Units / Tasks)

Task charts by priority

Maintenance schedule templates

Toast notifications instead of alerts

v1.0.0 – Stable Release

Authentication (JWT)

Postgres + Alembic migrations

Responsive UI + deployment build

📜 License
Licensed under the Prosperity Public License
(Free for personal/non-commercial use — commercial license required for revenue use.)
Transitions to open-source after revenue/time milestone.