from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    password = Column(String, nullable=False)
    
    # Quan hệ 1-1 với StudentProfile
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    username = Column(String, ForeignKey("users.username"), primary_key=True)
    name = Column(String, default="Sinh viên")
    current_chapter = Column(String, default="C# Cơ bản")
    
    # Dữ liệu JSON để lưu danh sách và cấu trúc động
    weak_topics = Column(JSON, default=list)
    completed_topics = Column(JSON, default=list)
    skills = Column(JSON, default={
        "C# Cơ bản": 0,
        "OOP": 0,
        "WinForms cơ bản": 0,
        "Controls": 0,
        "Event Handling": 0,
        "Form Navigation": 0,
        "DataGridView": 0,
        "Validation": 0,
        "ADO.NET": 0,
        "SQL": 0,
        "CRUD": 0,
        "Project tổng hợp": 0
    })

    user = relationship("User", back_populates="profile")
