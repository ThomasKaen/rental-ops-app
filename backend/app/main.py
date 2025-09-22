# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from .db import init_db
from .routers import sites, units, tasks, inventory, task_io

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

app.include_router(sites.router)
app.include_router(units.router)
app.include_router(tasks.router)
app.include_router(inventory.router)
app.include_router(task_io.router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"ok": True, "service": "rental-ops-api"}
