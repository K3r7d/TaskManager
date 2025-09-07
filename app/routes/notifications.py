from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, database

router = APIRouter(prefix="/notifications", tags=["notifications"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{user_id}")
def create_notification(user_id: int, message: str, db: Session = Depends(get_db)):
    return crud.create_notification(db, user_id, message)


@router.get("/{user_id}")
def get_notifications(user_id: int, unread_only: bool = False, db: Session = Depends(get_db)):
    return crud.get_notifications(db, user_id, unread_only)


@router.put("/{notif_id}")
def mark_as_read(notif_id: int, db: Session = Depends(get_db)):
    return crud.mark_notification_as_read(db, notif_id)
