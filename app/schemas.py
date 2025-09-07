from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ======================
# USERS
# ======================
class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True



# ======================
# TASKS
# ======================
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    completed: Optional[bool]


class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ======================
# FILES
# ======================
class FileBase(BaseModel):
    filename: str
    filepath: str


class FileCreate(FileBase):
    pass


class File(FileBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True



# ======================
# NOTIFICATIONS
# ======================
class NotificationBase(BaseModel):
    message: str


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True




# ======================
# AUTHORIZATION
# ======================

from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
