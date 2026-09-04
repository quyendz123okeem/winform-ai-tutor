from database import engine, Base
from models import User, StudentProfile

Base.metadata.create_all(bind=engine)
print("Created SQLite Database and tables successfully!")
