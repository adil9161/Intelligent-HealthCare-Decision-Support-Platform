from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

database_url = settings.DATABASE_URL

# Handle SQLite vs PostgreSQL configuration
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema_compatibility():
    """Auto-migrates SQLite dev database to add any recently added columns."""
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE staff ADD COLUMN attendance_percentage FLOAT DEFAULT 95.0"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("UPDATE staff SET attendance_percentage = 95.0 WHERE attendance_percentage IS NULL"))
            conn.commit()
        except Exception:
            pass

ensure_schema_compatibility()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

