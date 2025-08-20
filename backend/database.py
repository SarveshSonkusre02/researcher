import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Read DATABASE_URL from .env (preferred for Postgres/MySQL/etc.)
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to SQLite if not provided
if not DATABASE_URL:
    DATABASE_URL = "DATABASE_URL=postgresql+psycopg2://postgres:sarvesh@localhost:5432/research"

# Engine configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}, pool_pre_ping=True
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Declarative Base
class Base(DeclarativeBase):
    pass

# Dependency for routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
