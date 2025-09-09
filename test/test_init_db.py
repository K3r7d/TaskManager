# test/test_init_db.py
from app.init_db import init_db
from app.database import Base, engine

def test_init_db_creates_tables():
    init_db()
    # check if metadata has tables
    assert "users" in Base.metadata.tables
    assert "tasks" in Base.metadata.tables
