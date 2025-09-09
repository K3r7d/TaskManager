from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# ======================
# USERS
# ======================
class UserBase(BaseModel):
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ======================
# TASKS
# ======================
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    owner_id: int  # add owner for completeness

    model_config = ConfigDict(from_attributes=True)


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
    task_id: int

    model_config = ConfigDict(from_attributes=True)


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
    user_id: int

    model_config = ConfigDict(from_attributes=True)


# ======================
# AUTHORIZATION
# ======================
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: Optional[str] = None  # username or user_id inside JWT
