import os
from database import engine, Base, SessionLocal
from models import User, StudentProfile, Course, Chapter, Concept

def seed_db():
    print("Drop all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Create all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed Course
        course = Course(id="winforms_basic", name="Lập trình WinForms cơ bản", description="Khóa học lập trình WinForms bằng C#")
        db.add(course)
        
        # Seed Chapters
        chapters_data = [
            ("ch1", "C# Cơ bản", 1),
            ("ch2", "OOP (Lập trình hướng đối tượng)", 2),
            ("ch3", "WinForms cơ bản", 3),
            ("ch4", "Controls", 4),
            ("ch5", "Event Handling", 5),
            ("ch6", "Form Navigation", 6),
            ("ch7", "DataGridView", 7),
            ("ch8", "Validation", 8),
            ("ch9", "ADO.NET", 9),
            ("ch10", "SQL", 10),
            ("ch11", "CRUD Operations", 11)
        ]
        
        for ch_id, ch_name, ch_order in chapters_data:
            db.add(Chapter(id=ch_id, course_id="winforms_basic", name=ch_name, order_index=ch_order))
            
        # Seed Concepts (simplified for MVP)
        concepts_data = [
            ("c_var", "ch1", "Biến và kiểu dữ liệu", "Biến, hằng, kiểu dữ liệu trong C#", []),
            ("c_oop", "ch2", "Class & Object", "Lập trình hướng đối tượng", ["c_var"]),
            ("c_form", "ch3", "Form Lifecycle", "Vòng đời của Form", ["c_oop"]),
            ("c_controls", "ch4", "Basic Controls", "Button, TextBox, Label", ["c_form"]),
            ("c_event", "ch5", "Event & EventHandler", "Xử lý sự kiện", ["c_controls"]),
            ("c_dgv", "ch7", "DataGridView", "Hiển thị dữ liệu", ["c_event"]),
            ("c_sql", "ch10", "SQL Basic", "SELECT, INSERT, UPDATE, DELETE", []),
            ("c_ado", "ch9", "ADO.NET Connection", "Kết nối C# và SQL", ["c_oop", "c_sql"]),
            ("c_crud", "ch11", "CRUD Logic", "Thêm Sửa Xóa Tìm Kiếm", ["c_dgv", "c_ado", "c_event"])
        ]
        
        for c_id, ch_id, c_name, c_desc, c_pre in concepts_data:
            db.add(Concept(id=c_id, chapter_id=ch_id, name=c_name, description=c_desc, prerequisites=c_pre))
            
        db.commit()
        print("Seeded curriculum successfully.")
        
    except Exception as e:
        print("Lỗi:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
