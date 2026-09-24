import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    out = open("test_results.txt", "w", encoding="utf-8")
    def p(msg):
        out.write(msg + "\n")
        out.flush()

    p("="*50)
    p("BẮT ĐẦU CHẠY BỘ TEST CHECKPOINT 5")
    p("="*50)
    
    # ----------------------------------------
    # A. AUTHENTICATION
    # ----------------------------------------
    p("\n[A] AUTHENTICATION TESTS")
    try:
        res = requests.post(f"{BASE_URL}/api/login", json={"username": "wronguser", "password": "wrongpassword"})
        p(f"A02 (Sai Username): Status {res.status_code} - Expected 401")
    except Exception as e:
        p(f"A02 Error: {e}")
    
    test_user = f"testuser_{int(time.time())}"
    try:
        requests.post(f"{BASE_URL}/api/register", json={"username": test_user, "password": "password123"})
        res = requests.post(f"{BASE_URL}/api/login", json={"username": test_user, "password": "wrongpassword"})
        p(f"A03 (Sai Password): Status {res.status_code} - Expected 401")
    except Exception as e:
        p(f"A03 Error: {e}")
        
    try:
        res = requests.post(f"{BASE_URL}/api/login", json={"username": test_user, "password": "password123"})
        p(f"A01 (Đăng nhập đúng): Status {res.status_code} - Expected 200, Body: {res.json().get('status')}")
    except Exception as e:
        p(f"A01 Error: {e}")

    # ----------------------------------------
    # B. AI TUTOR
    # ----------------------------------------
    p("\n[B] AI TUTOR TESTS")
    p("B01 (Câu hỏi WinForms hợp lệ): Sending request...")
    try:
        res = requests.post(f"{BASE_URL}/api/chat", json={"student_id": test_user, "message": "Làm sao để tạo một nút bấm trong WinForms?"})
        b01_data = res.json()
        p(f"   Response status: {res.status_code}")
        p(f"   Content snippet: {str(b01_data.get('text', ''))[:100]}...")
    except Exception as e:
        p(f"B01 Error: {e}")
        
    p("B02 (Câu hỏi ngoài phạm vi): Sending request...")
    try:
        time.sleep(5)
        res = requests.post(f"{BASE_URL}/api/chat", json={"student_id": test_user, "message": "Cách nấu ăn món phở bò?"})
        b02_data = res.json()
        p(f"   Response status: {res.status_code}")
        p(f"   Content snippet: {str(b02_data.get('text', ''))[:100]}...")
    except Exception as e:
        p(f"B02 Error: {e}")

    # ----------------------------------------
    # C. RAG
    # ----------------------------------------
    p("\n[C] RAG TESTS")
    p("C01 (Retrieval RAG): Sending request...")
    try:
        time.sleep(5)
        res = requests.post(f"{BASE_URL}/api/chat", json={"student_id": test_user, "message": "Event handler là gì?"})
        c01_data = res.json()
        p(f"   Citation: {str(c01_data.get('citation'))}")
    except Exception as e:
        p(f"C01 Error: {e}")

    # ----------------------------------------
    # D. UPLOAD
    # ----------------------------------------
    p("\n[D] UPLOAD TESTS")
    try:
        with open("dummy.txt", "w", encoding="utf-8") as f:
            f.write("Tài liệu WinForms test.")
        with open("dummy.txt", "rb") as f:
            res = requests.post(f"{BASE_URL}/api/upload", files={"file": ("dummy.txt", f, "text/plain")})
        p(f"D01 (Upload file): Status {res.status_code} - {res.json()}")
    except Exception as e:
        p(f"D01 Error: {e}")

    # ----------------------------------------
    # E. CODE ANALYSIS
    # ----------------------------------------
    p("\n[E] CODE ANALYSIS TESTS")
    code_snippet = "private void button1_Click(object sender, EventArgs e) { MessageBox.Show('Hello') }"
    p("E01 (Code C# lỗi syntax): Sending request...")
    try:
        time.sleep(5)
        res = requests.post(f"{BASE_URL}/api/chat", json={"student_id": test_user, "message": f"Tìm lỗi trong code này:\\n```csharp\\n{code_snippet}\\n```"})
        e01_data = res.json()
        p(f"   Response status: {res.status_code}")
        p(f"   Content snippet: {str(e01_data.get('text', ''))[:100]}...")
    except Exception as e:
        p(f"E01 Error: {e}")

    # ----------------------------------------
    # F. STUDENT MODEL & G. ADAPTIVE RESPONSE
    # ----------------------------------------
    p("\n[F & G] STUDENT MODEL & ADAPTIVE TESTS")
    p("F01 (Cập nhật tiến độ): Đã gửi nhiều câu hỏi, kiểm tra lịch sử...")
    
    # ----------------------------------------
    # H. HISTORY
    # ----------------------------------------
    p("\n[H] HISTORY TESTS")
    try:
        res = requests.get(f"{BASE_URL}/api/history?student_id={test_user}")
        h01_data = res.json()
        p(f"H01 (Lấy lịch sử): Status {res.status_code}, Found {len(h01_data.get('history', []))} messages.")
    except Exception as e:
        p(f"H01 Error: {e}")
        
    out.close()

if __name__ == "__main__":
    run_tests()
