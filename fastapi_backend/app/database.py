"""Database connection setup using SQLAlchemy."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Gives each request its own database session, then closes it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
