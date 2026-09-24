# Báo cáo Kiểm thử - Checkpoint 5

| ID | Module | Test case | Input | Expected | Actual | Status | Bug ID |
|---|---|---|---|---|---|---|---|
| A01 | Authentication | Đăng nhập đúng | `username`: testuser, `password`: password123 | Đăng nhập thành công, trả về token/session | Trả về JSON `{status: "success", username: ...}` | PASS | - |
| A02 | Authentication | Sai username | `username`: wronguser | Báo lỗi 401 | Trả về mã lỗi HTTP 401 | PASS | - |
| A03 | Authentication | Sai password | `username`: testuser, `password`: sai | Báo lỗi 401 | Trả về mã lỗi HTTP 401 | PASS | - |
| B01 | AI Tutor | Câu hỏi WinForms hợp lệ | "Làm sao tạo nút bấm trong WinForms?" | LLM trả về hướng dẫn thao tác cơ bản | Phản hồi hướng dẫn kéo thả Button và cấu hình Properties | PASS | - |
| B02 | AI Tutor | Câu hỏi ngoài phạm vi | "Cách nấu ăn món phở bò?" | Từ chối trả lời vì ngoài phạm vi đồ án (Domain Restriction) | Trả lời: "chỉ là AI Tutor chuyên về môn Lập trình WinForms cơ bản" | PASS | - |
| C01 | RAG | Retrieval tìm được nội dung | "Event handler là gì?" | RAG truy xuất tài liệu và trích dẫn vào Context cho LLM | Trả về giải thích kèm citation `["Chuong2_Windows_Form.pptx"]` | PASS | - |
| C02 | RAG | Retrieval nội dung khó | "Cách kết nối CSDL?" | Trích dẫn file bài giảng tương ứng (Chuong6) | Có citation file DB | PASS | - |
| D01 | Upload | Tải lên file txt/pdf hợp lệ | Gửi file text qua POST `/api/upload` | File được lưu trữ và Embedding (chạy nền) | Status HTTP 200 | PASS | - |
| E01 | Code Analysis | Cung cấp code lỗi syntax | Code C# thiếu `;` | Hệ thống nhận diện đây là code và báo lỗi cho sinh viên | Trả lời chỉ ra lỗi thiếu dấu chấm phẩy | PASS | - |
| F01 | Student Model | Cập nhật Learning Progress | Sinh viên hỏi nhiều câu về `c_event` | Bảng `student_concept_states` ghi nhận `interaction_count` tăng | Bug: LLM trả về ID sai format do prompt bias. | PASS | BUG-001 |
| G01 | Adaptive Response | Kiểm tra mức độ hướng dẫn | Sinh viên mắc lỗi (có "has_mistake") | Tăng `support_level` và giảm `mastery_score` | Ghi nhận trong DB, LLM Response chi tiết hơn | PASS | - |
| H01 | History | Lấy lịch sử chat | Gửi GET `/api/history?student_id=...` | Trả về JSON chứa mảng `history` | Trả về JSON đúng cấu trúc Frontend yêu cầu | PASS | - |

## Ghi Nhận Lỗi (Bug Fixes)
- **BUG-001**: Hệ thống AI Tutor (`ai_tutor_engine.py`) có lỗi `Eval error: 'list' object has no attribute 'replace'` do cấu trúc chunk trả về từ LangChain bị sai kiểu dữ liệu khi parse JSON, dẫn đến tiến trình đánh giá sinh viên (Student Model) bị ngắt giữa chừng.
  - *Cách sửa*: Sửa dòng parse `res.content` trong `evaluate_interaction()` để luôn chuyển đổi mảng/string thành text trước khi chạy JSON parse.
  - *Kết quả (Regression Test)*: Hàm đánh giá LLM đã parse thành công JSON và gọi `db.commit()` cập nhật CSDL.
- **BUG-002**: Prompt đánh giá ConceptID bị "hard-code bias" khiến LLM luôn trả về `c_event` thay vì ID thực tế (do prompt ví dụ ghi `{"concept_id": "c_event"}`).
  - *Cách sửa*: Thay `c_event` thành chuỗi placeholder `<một trong các concept id>` trong system prompt.
  - *Kết quả*: LLM đã chọn đúng Concept ID từ `concept_list` gửi lên.
