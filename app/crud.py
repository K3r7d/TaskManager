from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime, timezone


# ======================
# USERS
# ======================
def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# ======================
# TASKS
# ======================
def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        owner_id=user_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return (
        db.query(models.Task)
        .filter(models.Task.owner_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    if db_task:
        if task_update.title is not None:
            db_task.title = task_update.title
        if task_update.description is not None:
            db_task.description = task_update.description
        if task_update.completed is not None:
            db_task.completed = task_update.completed
        db_task.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task


# ======================
# FILES
# ======================
def add_file(db: Session, file: schemas.FileCreate, task_id: int):
    db_file = models.File(
        filename=file.filename,
        filepath=file.filepath,
        task_id=task_id,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_files_for_task(db: Session, task_id: int):
    return db.query(models.File).filter(models.File.task_id == task_id).all()


# ======================
# NOTIFICATIONS
# ======================
def create_notification(db: Session, user_id: int, message: str):
    db_notif = models.Notification(
        message=message,
        user_id=user_id,
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif


def get_notifications(db: Session, user_id: int, unread_only: bool = False):
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
    return query.all()


def mark_notification_as_read(db: Session, notif_id: int):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif
