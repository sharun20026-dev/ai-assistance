from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL or "mysql+pymysql://root:@localhost:3306/ai_code_assistant"
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models before create_all so SQLAlchemy registers metadata.
    from app.models.user import User  # noqa: F401

    Base.metadata.create_all(bind=engine)


def verify_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        return True
    except SQLAlchemyError as e:
        print(f"✗ Database connection failed: {e}")
        return False