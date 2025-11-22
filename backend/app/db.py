from sqlmodel import SQLModel, create_engine, Session
import os

# --- Read DATABASE_URL from environment (Cloud Run passes it) ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")

# --- Engine setup ---
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

# --- Session dependency for FastAPI routes ---
def get_session():
    with Session(engine) as session:
        yield session

# --- Optional: initialize all tables manually (used in local dev) ---
def init_db():
    SQLModel.metadata.create_all(engine)
