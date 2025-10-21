# Rental Ops App

**Property operations tool** for managing Sites, Units, Tasks, and Inventory — now with **Dashboard** and **Maintenance Scheduler**.

---

## 🧭 Version
- **v0.3.0 – Maintenance Flow (MVP Complete)**
- Next: **v0.4.0 – Ops Reliability** (comments, attachments, digests, filters)

---

## ✨ New in v0.3.0
- **Dashboard:**  
  `/api/summary` KPIs + `/api/summary/overdue` list
- **Maintenance Scheduler:**  
  `/api/maintenance/preview` and `/api/maintenance/materialize`
- **Tasks:**  
  Recurrence fields in New Task modal
- **Unified API:**  
  All endpoints under `/api/*` (Axios-only client)
- **Infra:**  
  Python 3.14 backend, Node 22 + Nginx proxy (`/api` → FastAPI)
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