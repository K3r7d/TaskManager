# test_utils.py
from app.utils import hash_password, verify_password, create_access_token, verify_token
from app import utils

def test_hash_and_verify_password():
    """Test hashing and verifying passwords."""
    password = "mypassword"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_jwt_token_creation_and_verification():
    """Test JWT token creation and payload verification."""
    payload = {"sub": "testuser"}
    token = create_access_token(payload)

    decoded = verify_token(token)
    assert decoded["sub"] == "testuser"



def test_password_hash_and_verify():
    password = "secret123"
    hashed = utils.hash_password(password)
    assert utils.verify_password(password, hashed)

def test_create_and_decode_token():
    data = {"sub": "testuser"}
    token = utils.create_access_token(data)
    decoded = utils.decode_access_token(token)
    assert decoded["sub"] == "testuser"