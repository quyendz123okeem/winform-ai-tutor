import os
import time
import json
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from knowledge_base import knowledge_base
from database import SessionLocal
from models import StudentProfile, Concept, Chapter, InteractionHistory, StudentConceptState

load_dotenv()

BASE_SYSTEM_PROMPT = """Bạn là AI Tutor chuyên biệt cho môn học "Lập trình WinForms cơ bản" bằng C#.

## VAI TRÒ
Bạn là một giảng viên dạy kèm (tutor) tận tâm, kiên nhẫn, và chuyên nghiệp. Bạn KHÔNG phải là chatbot tổng quát. Bạn CHỈ hỗ trợ các kiến thức nằm trong phạm vi môn học.

## NGUYÊN TẮC QUAN TRỌNG NHẤT
1. **KHÔNG BAO GIỜ đưa toàn bộ source code hoàn chỉnh.** Hướng dẫn từng bước, đặt câu hỏi ngược.
2. **Luôn giải thích CONCEPT phía sau**, không chỉ sửa code.
3. **Kiểm tra prerequisite**: Trước khi giải thích khái niệm phức tạp, hãy hỏi sinh viên đã nắm các kiến thức nền tảng chưa.
4. **Tăng dần mức hỗ trợ**: Bắt đầu bằng gợi ý nhẹ → ví dụ cụ thể → cuối cùng mới đưa code mẫu ngắn (5-15 dòng).

## GIỚI HẠN DOMAIN
Nếu sinh viên hỏi ngoài phạm vi môn học (ví dụ: làm thơ, công thức nấu ăn, toán học không liên quan), từ chối nhẹ nhàng.
"""

class QuestionRouter:
    """Module định tuyến câu hỏi để giảm tải cho LLM."""
    @staticmethod
    def route(question: str) -> str:
        q = question.lower()
        if re.search(r'(thơ|hát|nấu ăn|bóng đá|thời tiết|tình yêu|chơi game|kể chuyện)', q):
            return "out_of_domain"
        if re.search(r'(lỗi|error|exception|bug|không chạy|tại sao sai|nullreference|sửa lỗi|fix)', q):
            return "code_debugging"
        if re.search(r'(làm sao để|cách viết|hướng dẫn|bài tập|code thế nào|viết code)', q):
            return "exercise_help"
        if re.search(r'(là gì|khái niệm|nghĩa là gì|định nghĩa|dùng để làm gì)', q):
            return "simple_definition"
        if re.search(r'(hoạt động như thế nào|tại sao|nguyên lý|phân biệt|so sánh)', q):
            return "concept_explanation"
        return "complex_question"

class ResponseCache:
    """Cache đơn giản trên bộ nhớ để trả lời ngay các câu hỏi trùng lặp."""
    def __init__(self):
        self._cache = {}
        
    def get(self, query: str):
        return self._cache.get(query.lower().strip())
        
    def set(self, query: str, data: dict):
        self._cache[query.lower().strip()] = data

def get_student_state_summary(student_id: str, db) -> dict:
    """Lấy và tóm tắt trạng thái học tập của sinh viên để làm rule."""
    profile = db.query(StudentProfile).filter(StudentProfile.username == student_id).first()
    student_name = profile.name if profile else "Sinh viên"
    
    states = db.query(StudentConceptState).filter(StudentConceptState.username == student_id).all()
    state_str = ""
    is_weak_overall = False
    weak_count = 0
    
    if not states:
        state_str = "Sinh viên chưa có nhiều dữ liệu tương tác. Hãy hướng dẫn từ cơ bản."
    else:
        for s in states:
            concept = db.query(Concept).filter(Concept.id == s.concept_id).first()
            if concept:
                c_name = concept.name
                mastery = "Khá" if s.mastery_score > 0.6 else "Yếu"
                if s.mastery_score <= 0.6:
                    weak_count += 1
                state_str += f"- {c_name}: {mastery} (Lỗi: {s.mistake_count}, Hỗ trợ: Level {s.support_level})\n"
    
    if weak_count > len(states) / 2 and len(states) > 0:
        is_weak_overall = True
        
    return {
        "student_name": student_name,
        "state_str": state_str,
        "is_weak_overall": is_weak_overall,
        "has_history": len(states) > 0
    }

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
            max_retries=1,
            timeout=30
        )
        
        self.eval_llm = ChatGoogleGenerativeAI(
            model="gemini-3.6-flash",
            google_api_key=api_key,
            temperature=0.0,
            max_retries=1,
            timeout=15
        )
        
        self.cache = ResponseCache()
    
    async def evaluate_interaction(self, student_id: str, question: str, answer: str, db):
        concepts = db.query(Concept).all()
        concept_list = [c.id for c in concepts]
        
        prompt = f"""
You are evaluating a student interaction in a C# WinForms course.
Available Concepts: {concept_list}
Student Question: {question}
Tutor Answer: {answer}

Determine:
1. Which single concept_id is most relevant? (Return exactly the ID or "none")
2. Did the student show a misunderstanding or make a mistake? (true/false)
3. Should the tutor increase the support level? (true/false)

Output ONLY valid JSON like this:
{{"concept_id": "<one of the provided concept ids>", "has_mistake": true, "increase_support": true}}
"""
        try:
            res = await self.eval_llm.ainvoke([HumanMessage(content=prompt)])
            if isinstance(res.content, list):
                text = "".join([c.get("text", "") for c in res.content if isinstance(c, dict) and "text" in c])
            else:
                text = str(res.content)
            text = text.replace("```json", "").replace("```", "").strip()
            data = json.loads(text)
            
            c_id = data.get("concept_id")
            if c_id in concept_list:
                state = db.query(StudentConceptState).filter(
                    StudentConceptState.username == student_id,
                    StudentConceptState.concept_id == c_id
                ).first()
                if not state:
                    state = StudentConceptState(username=student_id, concept_id=c_id)
                    db.add(state)
                
                state.interaction_count = (state.interaction_count or 0) + 1
                state.mastery_score = (state.mastery_score or 0.0)
                state.mistake_count = (state.mistake_count or 0)
                state.support_level = (state.support_level or 1)

                if data.get("has_mistake"):
                    state.mistake_count += 1
                    state.mastery_score = max(0.0, state.mastery_score - 0.1)
                else:
                    state.mastery_score = min(1.0, state.mastery_score + 0.1)
                    
                if data.get("increase_support"):
                    state.support_level = min(3, state.support_level + 1)
                
                db.commit()
                return c_id
        except Exception as e:
            print(f"[EVAL ERROR] Background Eval failed: {e}")
        return None

    async def background_evaluate(self, student_id: str, question: str, answer: str, user_hist_id: int, tutor_hist_id: int):
        print(f"[BACKGROUND TASK] Bắt đầu đánh giá interaction cho user {student_id}")
        start_eval_time = time.time()
        db = SessionLocal()
        try:
            detected_concept = await self.evaluate_interaction(student_id, question, answer, db)
            if detected_concept:
                u_hist = db.query(InteractionHistory).filter(InteractionHistory.id == user_hist_id).first()
                t_hist = db.query(InteractionHistory).filter(InteractionHistory.id == tutor_hist_id).first()
                if u_hist: u_hist.detected_concept_id = detected_concept
                if t_hist: t_hist.detected_concept_id = detected_concept
                db.commit()
            print(f"[BACKGROUND TASK] Đánh giá hoàn tất mất {time.time() - start_eval_time:.2f}s")
        except Exception as e:
            print(f"[BACKGROUND TASK ERROR] {e}")
        finally:
            db.close()
            
    def apply_adaptive_rules(self, base_text: str, student_summary: dict, intent: str) -> str:
        """Hệ thống Rule-based Adaptive Tutoring."""
        result_text = base_text
        
        if student_summary["is_weak_overall"]:
            result_text += "\n\n💡 **Gợi ý của Tutor:** Hãy ôn tập chậm lại và thực hành từng bước cơ bản nhé."
        
        if intent == "simple_definition" and student_summary["has_history"]:
            result_text += "\n\n👉 **Thực hành:** Bạn hãy thử mở Visual Studio và tạo một control này xem sao!"
            
        return result_text
    
    async def chat(self, student_id: str, user_message: str, images: list = None) -> dict:
        t0 = time.time()
        if images is None: images = []
        
        ai_mode = os.getenv("AI_MODE", "HYBRID") # LOCAL_ONLY or HYBRID
        
        # 1. Routing
        t_route_start = time.time()
        intent = QuestionRouter.route(user_message)
        routing_time_ms = (time.time() - t_route_start) * 1000
        
        # 2. Cache Check
        t_cache_start = time.time()
        cached_res = self.cache.get(user_message)
        cache_time_ms = (time.time() - t_cache_start) * 1000
        if cached_res:
            print(f"[CACHE HIT] Trả lời từ cache cho câu hỏi: {user_message}")
            cached_res["response_time_ms"] = (time.time() - t0) * 1000
            cached_res["used_llm"] = False
            return cached_res
            
        # 3. Domain Check
        if intent == "out_of_domain":
            res = {
                "text": "Xin lỗi, tôi là AI Tutor chuyên về môn Lập trình WinForms. Tôi không thể hỗ trợ bạn các vấn đề ngoài lề môn học.",
                "citation": None,
                "status": "success",
                "used_llm": False,
                "intent": intent,
            }
            self.cache.set(user_message, res.copy())
            return res

        db = SessionLocal()
        try:
            # Lấy thông tin Student
            student_summary = get_student_state_summary(student_id, db)
            
            # 4. RAG Retrieval
            t_rag_start = time.time()
            rag_context = ""
            rag_sources = []
            best_chunk = None
            try:
                search_results = await knowledge_base.search(user_message, n_results=3)
                if search_results:
                    best_chunk = search_results[0]
                    rag_context = "\n\n## TÀI LIỆU THAM KHẢO TỪ KNOWLEDGE BASE\n"
                    for i, result in enumerate(search_results):
                        src = result.get('source', 'Unknown Document')
                        rag_context += f"### Nguồn: {src}\n{result['text']}\n\n"
                        if src not in rag_sources:
                            rag_sources.append(src)
            except Exception as e:
                print(f"RAG Error: {e}")
            retrieval_time_ms = (time.time() - t_rag_start) * 1000
            
            # 5. Local Answer Decision
            if ai_mode == "LOCAL_ONLY" or (intent in ["simple_definition", "concept_explanation"] and best_chunk):
                # Adaptive Rules apply here
                if best_chunk:
                    base_text = f"Dựa trên tài liệu hệ thống ({best_chunk['source']}):\n\n{best_chunk['text']}"
                    final_text = self.apply_adaptive_rules(base_text, student_summary, intent)
                else:
                    final_text = "Xin lỗi, tôi không tìm thấy thông tin trong hệ thống tài liệu hiện tại (Chế độ hoạt động không dùng LLM)."
                    
                citation = ", ".join(rag_sources) if rag_sources else None
                
                # Lưu DB
                user_msg_hist = InteractionHistory(username=student_id, role="user", content=user_message)
                tutor_msg_hist = InteractionHistory(
                    username=student_id, role="tutor", content=final_text, retrieved_sources=rag_sources
                )
                db.add(user_msg_hist)
                db.add(tutor_msg_hist)
                db.commit()
                db.refresh(user_msg_hist)
                db.refresh(tutor_msg_hist)
                
                res = {
                    "text": final_text,
                    "citation": citation,
                    "status": "success",
                    "used_llm": False,
                    "intent": intent,
                    "user_hist_id": user_msg_hist.id,
                    "tutor_hist_id": tutor_msg_hist.id
                }
                self.cache.set(user_message, res.copy())
                return res
            
            # 6. LLM Fallback
            t_llm_start = time.time()
            hist_records = db.query(InteractionHistory).filter(
                InteractionHistory.username == student_id
            ).order_by(InteractionHistory.id.desc()).limit(10).all()
            hist_records.reverse()
            
            concepts = db.query(Concept).all()
            concept_map = [f"- {c.name} (ID: {c.id})" for c in concepts]
            curriculum_str = "## BẢN ĐỒ KIẾN THỨC MÔN HỌC (CURRICULUM)\n" + "\n".join(concept_map)
            
            student_context = f"## THÔNG TIN SINH VIÊN\n- Tên: {student_summary['student_name']}\n- Lịch sử kỹ năng:\n{student_summary['state_str']}"
            
            dynamic_prompt = BASE_SYSTEM_PROMPT + "\n\n" + curriculum_str + "\n\n" + student_context
            
            messages = [SystemMessage(content=dynamic_prompt + rag_context)]
            for msg in hist_records:
                messages.append(HumanMessage(content=msg.content) if msg.role == "user" else AIMessage(content=msg.content))
                
            if not images:
                messages.append(HumanMessage(content=user_message))
            else:
                content_parts = [{"type": "text", "text": user_message}]
                for b64 in images:
                    content_parts.append({"type": "image_url", "image_url": {"url": b64}})
                messages.append(HumanMessage(content=content_parts))
            
            response = await self.llm.ainvoke(messages)
            ai_response = response.content
            if isinstance(ai_response, list):
                ai_response = "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in ai_response)
            
            llm_time_ms = (time.time() - t_llm_start) * 1000
            
            # Lưu DB
            user_msg_hist = InteractionHistory(username=student_id, role="user", content=user_message)
            tutor_msg_hist = InteractionHistory(
                username=student_id, role="tutor", content=ai_response, retrieved_sources=rag_sources
            )
            db.add(user_msg_hist)
            db.add(tutor_msg_hist)
            db.commit()
            db.refresh(user_msg_hist)
            db.refresh(tutor_msg_hist)
            
            total_time_ms = (time.time() - t0) * 1000
            
            print("\n" + "="*40)
            print("[TIMING] SYSTEM-FIRST PIPELINE")
            print(f"- Routing: {routing_time_ms:.2f} ms")
            print(f"- Cache: {cache_time_ms:.2f} ms")
            print(f"- RAG Retrieval: {retrieval_time_ms:.2f} ms")
            print(f"- LLM Fallback: {llm_time_ms:.2f} ms")
            print(f"- TOTAL: {total_time_ms:.2f} ms")
            print("="*40 + "\n")
            
            citation = ", ".join(rag_sources) if rag_sources else None
            
            res = {
                "text": ai_response,
                "citation": citation,
                "status": "success",
                "used_llm": True,
                "intent": intent,
                "user_hist_id": user_msg_hist.id,
                "tutor_hist_id": tutor_msg_hist.id
            }
            # Cache the LLM response too
            self.cache.set(user_message, res.copy())
            return res
            
        except Exception as e:
            return {
                "text": f"Lỗi hệ thống: {str(e)}",
                "citation": None,
                "status": "error"
            }
        finally:
            db.close()

tutor_engine = AITutorEngine()
