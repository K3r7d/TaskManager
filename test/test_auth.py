from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_login():
    # Register
    response = client.post("/auth/register", json={
        "username": "int_test",
        "email": "int@test.com",
        "password": "testpass"
    })
    assert response.status_code == 200
    assert response.json()["username"] == "int_test"

    # Login
    response = client.post("/auth/login", data={
        "username": "int_test",
        "password": "testpass"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
