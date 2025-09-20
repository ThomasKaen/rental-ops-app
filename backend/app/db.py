from sqlmodel import SQLModel, create_engine, Session
import os


DB_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {})


def init_db():
    from . import models # ensure models are imported
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session