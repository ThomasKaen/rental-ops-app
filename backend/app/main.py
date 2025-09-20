from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .routers import sites, units, tasks, inventory


app = FastAPI(title="Airbnb Ops API")


# CORS for local dev and vite
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(sites.router)
app.include_router(units.router)
app.include_router(tasks.router)
app.include_router(inventory.router)


@app.get("/")
def root():
    return {"ok": True, "service": "airbnb-ops-api"}