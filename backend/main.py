import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User, StudentProfile, InteractionHistory, Course, Chapter, Concept
from ai_tutor_engine import tutor_engine
from knowledge_base import knowledge_base, UPLOAD_DIR

app = FastAPI(title="WinForms AI Tutor API")

# Configure CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- MODELS ----
class AuthRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    message: str
    student_id: str = "student_A"
    images: Optional[List[str]] = []



# ---- AUTH ROUTES ----
@app.get("/")
def read_root():
    return {"message": "Welcome to WinForms AI Tutor Engine API"}

@app.post("/api/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):
    username = request.username.lower()
    user = db.query(User).filter(User.username == username).first()
    
    if user and user.password == request.password:
        return {"status": "success", "username": user.username, "token": "mock_token_123"}
    raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không đúng")

@app.post("/api/register")
def register(request: AuthRequest, db: Session = Depends(get_db)):
    username = request.username.lower()
    
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Tài khoản đã tồn tại")
    
    # Tạo user mới
    new_user = User(username=username, password=request.password)
    # Khởi tạo profile mặc định cho sinh viên mới
    new_profile = StudentProfile(username=username, name=f"Học viên {username}", current_chapter_id="ch1")
    
    db.add(new_user)
    db.add(new_profile)
    db.commit()
    
    return {"status": "success", "message": "Đăng ký thành công"}

# ---- CHAT ROUTE ----
@app.post("/api/chat")
async def chat_with_tutor(request: ChatRequest, background_tasks: BackgroundTasks):
    """Gửi câu hỏi và nhận phản hồi từ AI Tutor (Gemini + RAG)."""
    try:
        result = await tutor_engine.chat(request.student_id, request.message, request.images)
        
        # Thêm task ngầm để đánh giá Student Model sau khi đã có response
        if result.get("status") == "success":
            background_tasks.add_task(
                tutor_engine.background_evaluate,
                request.student_id,
                request.message,
                result["text"],
                result.get("user_hist_id"),
                result.get("tutor_hist_id")
            )
            
        return result
    except Exception as e:
        error_msg = str(e)
        if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
            return {
                "text": "⚠️ Xin lỗi, hệ thống AI Tutor hiện đang quá tải lượt truy cập (vượt giới hạn hạn mức miễn phí). Vui lòng đợi khoảng 1 phút rồi gửi lại câu hỏi nhé!",
                "citation": None,
                "status": "error"
            }
        return {
            "text": f"Xin lỗi, có lỗi hệ thống xảy ra: {error_msg}",
            "citation": None,
            "status": "error"
        }

@app.get("/api/history")
def get_history(student_id: str, db: Session = Depends(get_db)):
    """Lấy lịch sử chat của sinh viên từ database."""
    history = db.query(InteractionHistory).filter(
        InteractionHistory.username == student_id
    ).order_by(InteractionHistory.id.asc()).all()
    
    formatted = []
    for h in history:
        formatted.append({
            "id": h.id,
            "sender": "student" if h.role == "user" else "tutor",
            "text": h.content,
            "citation": ", ".join(h.retrieved_sources) if h.retrieved_sources else None
        })
    return {"status": "success", "history": formatted}

@app.get("/api/curriculum")
def get_curriculum(db: Session = Depends(get_db)):
    """Lấy lộ trình môn học."""
    chapters = db.query(Chapter).order_by(Chapter.order_index.asc()).all()
    data = []
    for ch in chapters:
        concepts = db.query(Concept).filter(Concept.chapter_id == ch.id).all()
        data.append({
            "id": ch.id,
            "name": ch.name,
            "concepts": [{"id": c.id, "name": c.name} for c in concepts]
        })
    return {"status": "success", "curriculum": data}

# ---- UPLOAD ROUTES (RAG) ----
@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload tài liệu (PDF, DOCX, TXT, code) vào Knowledge Base."""
    try:
        # Lưu file vào thư mục uploads/
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # Xử lý tài liệu: đọc → cắt chunks → embedding → lưu ChromaDB
        result = await knowledge_base.add_document(str(file_path), file.filename)
        return result
    except Exception as e:
        return {"status": "error", "message": f"Lỗi khi xử lý file: {str(e)}"}

@app.get("/api/knowledge/stats")
def get_knowledge_stats():
    """Xem thống kê Knowledge Base (số tài liệu, số chunks)."""
    return knowledge_base.get_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
