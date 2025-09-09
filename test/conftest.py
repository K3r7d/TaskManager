# conftest.py (shared fixtures for all tests)
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.database import SessionLocal
from app.utils import create_access_token


@pytest.fixture(scope="function")
def client():
    """Fixture for FastAPI test client."""
    return TestClient(app)


@pytest.fixture(scope="function")
def db():
    """Fixture for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def auth_headers():
    """Fixture for authorization headers with a valid JWT token."""
    token = create_access_token({"sub": "testuser"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def db_connection_check(db):
    """Ensure DB connection works before tests run."""
    result = db.execute(text("SELECT 1"))
    assert result.scalar() == 1
