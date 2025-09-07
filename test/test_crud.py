import pytest
from app import crud, schemas
from app.database import SessionLocal
from app.models import User

@pytest.fixture
def db():
    db = SessionLocal()
    yield db
    db.close()

def test_create_user(db):
    user_data = schemas.UserCreate(username="testuser", email="test@test.com", password="password")
    hashed_pw = "fakehashed"
    user = crud.create_user(db, user=user_data, hashed_password=hashed_pw)
    assert user.username == "testuser"
    assert user.email == "test@test.com"
