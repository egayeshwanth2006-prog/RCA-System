import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

logger = logging.getLogger("aivoa.database")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/aivoa_rca")
FALLBACK_DATABASE_URL = os.getenv("FALLBACK_DATABASE_URL", "sqlite:///./rca_database.db")

Base = declarative_base()

# Attempt database connection with graceful fallback to SQLite
engine = None
active_db_type = "unknown"

try:
    if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgresql+psycopg2://"):
        # Fix URL scheme if needed for SQLAlchemy 2.0
        pg_url = DATABASE_URL
        if pg_url.startswith("postgresql://"):
            pg_url = pg_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
        # Test connection with short timeout
        test_engine = create_engine(pg_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine = test_engine
        active_db_type = "PostgreSQL"
        logger.info(f"Connected to PostgreSQL database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'configured'}")
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
        active_db_type = "SQLite" if "sqlite" in DATABASE_URL else "SQLAlchemy"
        logger.info(f"Connected to database: {active_db_type}")
except Exception as e:
    logger.warning(f"Could not connect to primary DATABASE_URL ({DATABASE_URL}): {e}")
    logger.info(f"Falling back to local SQLite database at {FALLBACK_DATABASE_URL}...")
    engine = create_engine(FALLBACK_DATABASE_URL, connect_args={"check_same_thread": False})
    active_db_type = "SQLite (Fallback)"

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_status():
    """Return status information for the database connection."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "type": active_db_type,
            "url": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url)
        }
    except Exception as e:
        return {
            "status": "error",
            "type": active_db_type,
            "error": str(e)
        }

def init_db():
    from app.models.investigation import Investigation, Document, RootCause, CapaAction, InvestigationHistory
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
