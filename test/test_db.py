import pytest
from app.database import SessionLocal, engine
from sqlalchemy import text

@pytest.fixture
def db():
    db = SessionLocal()
    yield db
    db.close()

def test_connection(db):
    result = db.execute(text("SELECT 1"))
    assert result.scalar() == 1
