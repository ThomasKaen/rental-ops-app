import os
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from .db import init_db
from .routers.sites import router as sites_router
from .routers.units import router as units_router
from .routers.tasks import router as tasks_router
from .routers.inventory import router as inventory_router
from .routers.task_io import router as task_io_router
from .routers.summary import router as summary_router
from .routers.maintenance import router as maintenance_router

if os.getenv("ENV", "development") != "production":
    load_dotenv()            # or load_dotenv(override=False)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield  # teardown if needed

app = FastAPI(
    title="Rental Ops API",
    docs_url="/api/docs",             # 👈 move docs under /api
    openapi_url="/api/openapi.json",  # 👈 move schema under /api
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://rental-ops-app.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# mount all feature routers under /api
api = APIRouter(prefix="/api")
app.include_router(sites_router)
app.include_router(units_router)
app.include_router(tasks_router)
app.include_router(inventory_router)
app.include_router(summary_router)
app.include_router(maintenance_router)
app.include_router(api)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"ok": True, "service": "rental-ops-api"}