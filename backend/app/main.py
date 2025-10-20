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

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield  # teardown if needed

app = FastAPI(title="Rental Ops API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sites_router, prefix="/api")
app.include_router(units_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(task_io_router, prefix="/api")
app.include_router(summary_router, prefix="/api")
app.include_router(maintenance_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"ok": True, "service": "rental-ops-api"}
