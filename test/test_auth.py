import uuid

def test_register_and_login(client):
    """Test user registration and login flow with unique credentials."""
    unique_email = f"int_{uuid.uuid4().hex[:8]}@test.com"
    unique_username = f"user_{uuid.uuid4().hex[:8]}"

    # --- Register ---
    response = client.post(
        "/auth/register",
        json={
            "username": unique_username,
            "email": unique_email,
            "password": "testpass",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["email"] == unique_email

   # --- Login ---
    response = client.post(
        "/auth/login",
        data={"username": unique_username, "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    login_data = response.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"

