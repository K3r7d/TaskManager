from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from .. import crud, schemas, database
import shutil
import os

router = APIRouter(prefix="/files", tags=["files"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{task_id}")
def upload_file(task_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_data = schemas.FileCreate(filename=file.filename, filepath=file_path)
    return crud.add_file(db, file_data, task_id)


@router.get("/{task_id}", response_model=list[schemas.File])
def list_files(task_id: int, db: Session = Depends(get_db)):
    return crud.get_files_for_task(db, task_id)
