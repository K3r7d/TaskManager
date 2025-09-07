from fastapi.testclient import TestClient
from app.main import app
from app.utils import create_access_token

client = TestClient(app)

token = create_access_token({"sub": "int_test"})
headers = {"Authorization": f"Bearer {token}"}

def test_create_task():
    response = client.post("/tasks/", json={
        "title": "Test Task",
        "description": "This is a test task"
    }, headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Task"

def test_get_tasks():
    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
