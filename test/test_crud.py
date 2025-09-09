import uuid
import pytest
from datetime import datetime
from app import schemas, crud
from app.database import SessionLocal


@pytest.fixture
def db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================
# USERS
# ======================
def test_create_and_get_user(db):
    unique_email = f"{uuid.uuid4().hex[:8]}@test.com"
    unique_username = f"user_{uuid.uuid4().hex[:8]}"

    user_data = schemas.UserCreate(
        username=unique_username,
        email=unique_email,
        password="password",
    )
    user = crud.create_user(db, user=user_data, hashed_password="fakehashed")

    # Fetch by ID
    fetched = crud.get_user(db, user.id)
    assert fetched.id == user.id

    # Fetch by username
    fetched_by_username = crud.get_user_by_username(db, unique_username)
    assert fetched_by_username.id == user.id

    # Fetch by email
    fetched_by_email = crud.get_user_by_email(db, unique_email)
    assert fetched_by_email.id == user.id


def test_get_nonexistent_user_returns_none(db):
    assert crud.get_user(db, user_id=999999) is None
    assert crud.get_user_by_username(db, "nonexistent") is None
    assert crud.get_user_by_email(db, "fake@example.com") is None


# ======================
# TASKS
# ======================
def test_create_get_update_delete_task(db):
    # First create a user
    unique_email = f"{uuid.uuid4().hex[:8]}@test.com"
    user_data = schemas.UserCreate(
        username=f"user_{uuid.uuid4().hex[:8]}",
        email=unique_email,
        password="password",
    )
    user = crud.create_user(db, user=user_data, hashed_password="fakehashed")

    # Create task
    task_data = schemas.TaskCreate(title="Test Task", description="Some details")
    task = crud.create_task(db, task=task_data, user_id=user.id)
    assert task.id is not None

    # Get tasks for user
    tasks = crud.get_tasks(db, user_id=user.id)
    assert len(tasks) >= 1

    # Get single task
    fetched = crud.get_task(db, task.id)
    assert fetched.id == task.id

    # Update task
    update_data = schemas.TaskUpdate(
        title="Updated Task", description="Updated desc", completed=True
    )
    updated = crud.update_task(db, task.id, update_data)
    assert updated.title == "Updated Task"
    assert updated.description == "Updated desc"
    assert updated.completed is True
    assert isinstance(updated.updated_at, datetime)

    # Delete task
    deleted = crud.delete_task(db, task.id)
    assert deleted.id == task.id
    assert crud.get_task(db, task.id) is None


def test_update_nonexistent_task(db):
    updated = crud.update_task(db, 999999, schemas.TaskUpdate(title="X"))
    assert updated is None

def test_delete_nonexistent_task(db):
    deleted = crud.delete_task(db, 999999)
    assert deleted is None


# ======================
# FILES
# ======================
def test_add_and_get_files(db):
    # Create a user + task
    user = crud.create_user(
        db,
        user=schemas.UserCreate(
            username=f"user_{uuid.uuid4().hex[:8]}",
            email=f"{uuid.uuid4().hex[:8]}@test.com",
            password="password",
        ),
        hashed_password="fakehashed",
    )
    task = crud.create_task(
        db, schemas.TaskCreate(title="File Task", description="File desc"), user.id
    )

    # Add file
    file_data = schemas.FileCreate(filename="test.txt", filepath="/tmp/test.txt")
    file = crud.add_file(db, file=file_data, task_id=task.id)
    assert file.id is not None

    # Get files for task
    files = crud.get_files_for_task(db, task_id=task.id)
    assert len(files) == 1
    assert files[0].filename == "test.txt"


# ======================
# NOTIFICATIONS
# ======================
def test_create_and_get_notifications(db):
    # Create a user
    user = crud.create_user(
        db,
        user=schemas.UserCreate(
            username=f"user_{uuid.uuid4().hex[:8]}",
            email=f"{uuid.uuid4().hex[:8]}@test.com",
            password="password",
        ),
        hashed_password="fakehashed",
    )

    # Create notification
    notif = crud.create_notification(db, user_id=user.id, message="Hello!")
    assert notif.id is not None
    assert notif.is_read is False

    # Get all notifications
    notifs = crud.get_notifications(db, user_id=user.id)
    assert len(notifs) == 1

    # Get unread notifications
    unread = crud.get_notifications(db, user_id=user.id, unread_only=True)
    assert len(unread) == 1

    # Mark as read
    updated = crud.mark_notification_as_read(db, notif.id)
    assert updated.is_read is True

    # Now unread_only should return empty
    unread_after = crud.get_notifications(db, user_id=user.id, unread_only=True)
    assert len(unread_after) == 0


def test_mark_nonexistent_notification_as_read(db):
    notif = crud.mark_notification_as_read(db, 999999)
    assert notif is None
