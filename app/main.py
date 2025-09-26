from fastapi import FastAPI
from .routes import auth, tasks, files, notifications
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models

app = FastAPI(title="Task Manager API")
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(files.router)
app.include_router(notifications.router)

origins = [
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000",
    # Add your deployed frontend URLs
    "https://*.onrender.com",  # Render frontend URLs
    "https://*.up.railway.app",  # Railway frontend URLs
    "https://*.railway.app",  # Railway custom domains
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "TaskManager API is running"}