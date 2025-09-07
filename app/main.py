from fastapi import FastAPI
from .routes import auth, tasks, files, notifications

app = FastAPI(title="Task Manager API")

# Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(files.router)
app.include_router(notifications.router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "TaskManager API is running"}