from .database import engine, Base
from . import models

print("📌 Creating all database tables...")
Base.metadata.create_all(bind=engine)
print("✅ All tables created successfully!")
