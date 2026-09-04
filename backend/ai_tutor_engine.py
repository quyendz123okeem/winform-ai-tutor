"""
AI Tutor Engine - Bộ não của hệ thống AI Tutor WinForms
Kết nối với Gemini API qua LangChain, sử dụng System Prompt chuyên biệt
để đóng vai một giảng viên dạy kèm môn WinForms.
Tích hợp RAG để trả lời dựa trên tài liệu môn học đã upload.
"""

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from knowledge_base import knowledge_base
from database import SessionLocal
from models import StudentProfile

load_dotenv()

# ============================================================
# SYSTEM PROMPT - "Linh hồn" của AI Tutor
# Đây chính là nơi "train" AI cách cư xử như một giảng viên
# ============================================================
SYSTEM_PROMPT = """Bạn là AI Tutor chuyên biệt cho môn học "Lập trình WinForms cơ bản" bằng C#.

## VAI TRÒ
Bạn là một giảng viên dạy kèm (tutor) tận tâm, kiên nhẫn, và chuyên nghiệp. Bạn KHÔNG phải là chatbot tổng quát. Bạn CHỈ hỗ trợ các kiến thức nằm trong phạm vi môn học WinForms và C#.

## NGUYÊN TẮC QUAN TRỌNG NHẤT
1. **KHÔNG BAO GIỜ đưa toàn bộ source code hoàn chỉnh cho sinh viên.** Thay vào đó, hướng dẫn từng bước, đặt câu hỏi ngược để kiểm tra hiểu biết.
2. **Luôn giải thích CONCEPT phía sau**, không chỉ sửa code. Ví dụ: giải thích tại sao cần Event Handler, Form Lifecycle hoạt động như thế nào.
3. **Kiểm tra prerequisite**: Trước khi giải thích một khái niệm phức tạp, hãy hỏi sinh viên đã nắm các kiến thức nền tảng chưa.
4. **Tăng dần mức hỗ trợ**: Bắt đầu bằng gợi ý nhẹ → nếu sinh viên vẫn không hiểu → đưa ví dụ cụ thể hơn → cuối cùng mới đưa code mẫu ngắn.

## CURRICULUM - BẢN ĐỒ KIẾN THỨC MÔN HỌC
Đây là lộ trình kiến thức của môn học, từ cơ bản đến nâng cao:

1. **C# cơ bản**: Biến, kiểu dữ liệu, vòng lặp, điều kiện, hàm, mảng
2. **OOP (Lập trình hướng đối tượng)**: Class, Object, Inheritance, Encapsulation, Polymorphism
3. **WinForms cơ bản**: Tạo Form, Properties, Designer, Build & Run
4. **Controls**: Button, Label, TextBox, ComboBox, ListBox, CheckBox, RadioButton, Panel, GroupBox
5. **Event Handling**: Event, EventHandler, delegate, Subscribe/Unsubscribe sự kiện, Form Lifecycle
6. **Form Navigation**: Mở Form mới, truyền dữ liệu giữa các Form, MDI Form, Dialog
7. **DataGridView**: Hiển thị dữ liệu dạng bảng, DataSource, BindingSource, thêm/sửa/xóa dòng
8. **Validation**: ErrorProvider, kiểm tra input, Regular Expression
9. **ADO.NET**: SqlConnection, SqlCommand, SqlDataReader, SqlDataAdapter, ConnectionString
10. **SQL**: Cú pháp cơ bản, SELECT, INSERT, UPDATE, DELETE, Database connection
11. **CRUD**: Thêm, Sửa, Xóa, Tìm kiếm dữ liệu với Database thực tế
12. **Project tổng hợp**: Kết hợp tất cả kiến thức trên

### QUAN HỆ PREREQUISITE:
- DataGridView yêu cầu: Collection, Controls, Event Handling
- ADO.NET yêu cầu: C# cơ bản, SQL cơ bản, Database connection
- CRUD yêu cầu: ADO.NET, DataGridView, Validation, Event Handling
- Form Navigation yêu cầu: WinForms cơ bản, Event Handling

## CÁCH TRẢ LỜI
- Dùng tiếng Việt tự nhiên, thân thiện, dễ hiểu.
- Sử dụng **Markdown** để format: in đậm khái niệm quan trọng, dùng code block cho code C#.
- Khi đưa code mẫu, chỉ đưa đoạn code ngắn minh họa (5-15 dòng), KHÔNG đưa toàn bộ source.
- Luôn kết thúc bằng một câu hỏi hoặc gợi ý để sinh viên tiếp tục suy nghĩ.
- Nếu có thể, trích dẫn kiến thức thuộc chương nào trong curriculum.

## GIỚI HẠN DOMAIN
- Nếu sinh viên hỏi ngoài phạm vi môn học (ví dụ: làm thơ, nấu ăn, lịch sử), hãy từ chối nhẹ nhàng và hướng sinh viên quay lại chủ đề WinForms.
- Nếu sinh viên hỏi về công nghệ liên quan (WPF, .NET MAUI, ASP.NET), có thể giải thích ngắn gọn sự khác biệt nhưng KHÔNG đi sâu. Hướng sinh viên tập trung vào WinForms.

## VÍ DỤ CÁCH TRẢ LỜI TỐT

Sinh viên: "Làm bài quản lý sinh viên giúp em"
→ KHÔNG trả: Đây là toàn bộ source code...
→ NÊN trả: "Bài quản lý sinh viên thường gồm các chức năng: Thêm, Sửa, Xóa, Tìm kiếm. Em đã thiết kế giao diện Form chưa? Nếu chưa, bước đầu tiên là em hãy kéo thả các Control cần thiết: DataGridView để hiển thị danh sách, TextBox để nhập thông tin, và Button cho các thao tác. Em thử làm phần giao diện trước, rồi mình sẽ hướng dẫn phần code logic nhé!"

Sinh viên: "Tại sao click button không chạy?"  
→ NÊN trả: "Lỗi này thường liên quan đến **Event Handling**. Em kiểm tra 2 điều:\n1. Trong tab Properties (hình sấm sét ⚡), sự kiện `Click` của Button đã được gán vào hàm xử lý chưa?\n2. Mở file `.Designer.cs`, tìm dòng `this.button1.Click += ...` có tồn tại không?\n\nNguyên lý: Chỉ viết hàm xử lý thôi là chưa đủ, phải **subscribe** (đăng ký) hàm đó vào sự kiện Click của Button. Em kiểm tra thử xem sao?"
"""

# ============================================================
# STUDENT MODEL - Hồ sơ học tập của sinh viên từ Database
# ============================================================
def get_student_context(student_id: str) -> str:
    """Tạo context về sinh viên để đưa vào prompt lấy từ DB."""
    db = SessionLocal()
    try:
        profile = db.query(StudentProfile).filter(StudentProfile.username == student_id).first()
        
        if not profile:
            return "## THÔNG TIN SINH VIÊN HIỆN TẠI\n- Chưa có thông tin cụ thể."

        weak = ", ".join(profile.weak_topics) if profile.weak_topics else "Chưa xác định"
        completed = ", ".join(profile.completed_topics) if profile.completed_topics else "Chưa hoàn thành chương nào"
        current = profile.current_chapter
        
        skills_text = "\n".join([f"  - {k}: {v}%" for k, v in profile.skills.items()])
        
        return f"""
## THÔNG TIN SINH VIÊN HIỆN TẠI
- Tên: {profile.name}
- Chương đang học: {current}
- Kiến thức đã hoàn thành: {completed}
- Điểm yếu cần cải thiện: {weak}
- Chi tiết kỹ năng:
{skills_text}

Hãy điều chỉnh cách giải thích phù hợp với trình độ hiện tại của sinh viên này.
Nếu sinh viên hỏi về kiến thức chưa học (ví dụ ADO.NET), hãy nhắc họ cần nắm prerequisite trước.
"""
    finally:
        db.close()

# ============================================================
# CHAT ENGINE - Kết nối Gemini API
# ============================================================
class AITutorEngine:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY chưa được cấu hình trong file .env")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.6-flash",
            google_api_key=api_key,
            temperature=0.7,
            max_output_tokens=2048,
        )
        
        # Lưu lịch sử hội thoại cho từng sinh viên (in-memory, sau này chuyển sang DB)
        self.conversations = {}
    
    def get_history(self, student_id: str) -> list:
        """Lấy lịch sử hội thoại của sinh viên."""
        if student_id not in self.conversations:
            self.conversations[student_id] = []
        return self.conversations[student_id]
    
    async def chat(self, student_id: str, user_message: str, images: list = None) -> dict:
        """Xử lý câu hỏi của sinh viên và trả về câu trả lời adaptive + RAG."""
        if images is None:
            images = []
        
        history = self.get_history(student_id)
        student_context = get_student_context(student_id)
        
        # ====== BƯỚC RAG: Tìm kiến thức liên quan từ tài liệu đã upload ======
        rag_context = ""
        rag_sources = []
        try:
            search_results = await knowledge_base.search(user_message, n_results=3)
            if search_results:
                rag_context = "\n\n## TÀI LIỆU THAM KHẢO TỪ MÔN HỌC\n"
                rag_context += "Dưới đây là các đoạn kiến thức từ tài liệu môn học liên quan đến câu hỏi. "
                rag_context += "Hãy ƯU TIÊN sử dụng kiến thức này để trả lời. Nếu trích dẫn, hãy ghi rõ nguồn.\n\n"
                for i, result in enumerate(search_results):
                    rag_context += f"### Đoạn {i+1} (Nguồn: {result['source']})\n{result['text']}\n\n"
                    if result['source'] not in rag_sources:
                        rag_sources.append(result['source'])
        except Exception:
            pass  # Nếu knowledge base chưa sẵn sàng thì bỏ qua
        
        # Xây dựng danh sách messages cho LLM
        messages = [
            SystemMessage(content=SYSTEM_PROMPT + student_context + rag_context)
        ]
        
        # Thêm lịch sử hội thoại (giữ 10 tin nhắn gần nhất)
        for msg in history[-10:]:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        
        # Thêm tin nhắn hiện tại
        if not images:
            messages.append(HumanMessage(content=user_message))
        else:
            content_parts = [{"type": "text", "text": user_message}]
            for b64 in images:
                # b64 từ frontend thường có dạng data:image/png;base64,iVBORw0K...
                # Langchain ChatGoogleGenerativeAI mong muốn url chứa base64 scheme
                content_parts.append({
                    "type": "image_url",
                    "image_url": {"url": b64}
                })
            messages.append(HumanMessage(content=content_parts))
        
        # Gọi Gemini API
        response = await self.llm.ainvoke(messages)
        ai_response = response.content
        
        # Đảm bảo ai_response luôn là string (Langchain Gemini có thể trả về list)
        if isinstance(ai_response, list):
            ai_response = "".join(
                part.get("text", "") if isinstance(part, dict) else str(part) 
                for part in ai_response
            )

        
        # Lưu vào lịch sử
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": ai_response})
        
        # Xác định citation: ưu tiên nguồn từ RAG, fallback sang detect
        if rag_sources:
            citation = "Tài liệu: " + ", ".join(rag_sources)
        else:
            citation = self._detect_citation(user_message, ai_response)
        
        return {
            "text": ai_response,
            "citation": citation,
            "status": "success"
        }
    
    def _detect_citation(self, question: str, answer: str) -> str:
        """Tự động xác định nguồn tài liệu liên quan."""
        q = question.lower()
        a = answer.lower()
        
        if any(kw in q or kw in a for kw in ["event", "sự kiện", "click", "handler"]):
            return "Chương 5 — Event Handling & Form Lifecycle"
        elif any(kw in q or kw in a for kw in ["datagridview", "bảng", "datasource"]):
            return "Chương 7 — DataGridView"
        elif any(kw in q or kw in a for kw in ["ado", "sql", "connection", "database", "kết nối"]):
            return "Chương 9 — ADO.NET & SQL"
        elif any(kw in q or kw in a for kw in ["form", "mở form", "navigation", "dialog"]):
            return "Chương 6 — Form Navigation"
        elif any(kw in q or kw in a for kw in ["button", "textbox", "label", "combobox", "control"]):
            return "Chương 4 — Các Control Cơ Bản"
        elif any(kw in q or kw in a for kw in ["class", "object", "kế thừa", "oop", "inheritance"]):
            return "Chương 2 — OOP"
        elif any(kw in q or kw in a for kw in ["validation", "kiểm tra", "errorprovider"]):
            return "Chương 8 — Validation"
        elif any(kw in q or kw in a for kw in ["crud", "thêm", "sửa", "xóa"]):
            return "Chương 10 — CRUD Operations"
        else:
            return "Giáo trình WinForms Cơ Bản"

# Singleton instance
tutor_engine = AITutorEngine()
