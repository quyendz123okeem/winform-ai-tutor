import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Đổi sang dùng SQLite để bạn KHÔNG CẦN CÀI ĐẶT gì thêm.
# Dữ liệu sẽ được lưu thẳng vào file winform_tutor.db trong thư mục backend.
SQLALCHEMY_DATABASE_URL = "sqlite:///./winform_tutor.db"

# connect_args={"check_same_thread": False} là bắt buộc đối với SQLite trong FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
