import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .db import init_db
from .routers.sites import router as sites_router
from .routers.units import router as units_router
from .routers.tasks import router as tasks_router
from .routers.inventory import router as inventory_router
from .routers.task_io import router as task_io_router
from .routers.summary import router as summary_router
from .routers.maintenance import router as maintenance_router

if os.getenv("ENV", "development") != "production":
    load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # initialise DB on startup
    init_db()
    yield


app = FastAPI(
    title="Rental Ops API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS – loosened for now, you can tighten later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API routers ---
app.include_router(sites_router, prefix="/api")
app.include_router(units_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(task_io_router, prefix="/api")
app.include_router(summary_router, prefix="/api")
app.include_router(maintenance_router, prefix="/api")

# uploads for task attachments
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# SPA mounting kept disabled for dev (Vite runs separately)
# FRONTEND_DIR = os.path.join(os.path.dirname(__file__), ".", "frontend", "dist")
# app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
