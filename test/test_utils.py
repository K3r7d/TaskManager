from app.utils import hash_password, verify_password, create_access_token, verify_token

def test_hash_verify_password():
    password = "mypassword"
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True

def test_jwt_token():
    data = {"sub": "testuser"}
    token = create_access_token(data)
    payload = verify_token(token)
    assert payload["sub"] == "testuser"
