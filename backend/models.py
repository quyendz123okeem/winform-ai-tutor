from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime, Text, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    password = Column(String, nullable=False)
    
    # Quan hệ 1-1 với StudentProfile
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    history = relationship("InteractionHistory", back_populates="user", cascade="all, delete-orphan")
    concept_states = relationship("StudentConceptState", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    username = Column(String, ForeignKey("users.username"), primary_key=True)
    name = Column(String, default="Sinh viên")
    current_chapter_id = Column(String, ForeignKey("chapters.id"), nullable=True)
    
    user = relationship("User", back_populates="profile")
    current_chapter = relationship("Chapter")

class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True) # e.g. "winforms_basic"
    name = Column(String)
    description = Column(Text)
    
    chapters = relationship("Chapter", back_populates="course")

class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey("courses.id"))
    name = Column(String)
    order_index = Column(Integer)
    
    course = relationship("Course", back_populates="chapters")
    concepts = relationship("Concept", back_populates="chapter")

class Concept(Base):
    __tablename__ = "concepts"
    id = Column(String, primary_key=True)
    chapter_id = Column(String, ForeignKey("chapters.id"))
    name = Column(String)
    description = Column(Text)
    prerequisites = Column(JSON, default=list) # List of concept_ids
    
    chapter = relationship("Chapter", back_populates="concepts")

class StudentConceptState(Base):
    __tablename__ = "student_concept_states"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, ForeignKey("users.username"))
    concept_id = Column(String, ForeignKey("concepts.id"))
    
    mastery_score = Column(Float, default=0.0) # 0.0 to 1.0
    interaction_count = Column(Integer, default=0)
    mistake_count = Column(Integer, default=0)
    support_level = Column(Integer, default=1) # 1: minimal, 2: hints, 3: step-by-step
    last_interaction = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="concept_states")
    concept = relationship("Concept")

class InteractionHistory(Base):
    __tablename__ = "interaction_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, ForeignKey("users.username"))
    role = Column(String) # "user" or "tutor"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    detected_concept_id = Column(String, ForeignKey("concepts.id"), nullable=True)
    retrieved_sources = Column(JSON, default=list) # Sources from RAG
    adaptive_action = Column(String, nullable=True) # E.g., "Provided hint", "Explained prerequisite"
    
    user = relationship("User", back_populates="history")
    concept = relationship("Concept")
