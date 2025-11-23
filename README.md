# Rental Ops App

**Property operations tool** for managing Sites, Units, Tasks, and Inventory — now with **Dashboard** and **Maintenance Scheduler**.

---

## 🧭 Version
- **v0.4.0 – Ops Reliability (complete)**
- Previous: v0.3.0 – Maintenance Flow
- Next: **v0.5.0 – Authentication & Activity Feed**


---

## ✨ New in v0.4.0
- **Task IO (Attachments + Comments)**  
  - Upload/download/delete attachments  
  - Add/delete comments  
  - New `<TaskAttachments />` + updated `<Comments />`  
  - Fully integrated into Task Detail  
- **Service Layer Architecture**  
  - New `services/*` folder  
  - All pages use Axios wrappers instead of inline fetch calls  
  - Strong typing across all modules  
- **UI Layer Stabilisation**  
  - Restored missing UI components (CardHeader, CardDescription, etc.)  
  - Clean Tailwind v4 setup  
  - Uniform spacing, colors, and page structure  
- **Cloud Deployment**  
  - Backend & frontend now deployed on **Google Cloud Run**  
  - Docker builds fixed (Nginx, ignore rules, dev artifacts)  
  - Production builds fully functional

This completes the **Ops reliability** goal for v0.4.0:  
A fully functioning daily operations tool with stable data flow, comments, attachments, and consistent UI.

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