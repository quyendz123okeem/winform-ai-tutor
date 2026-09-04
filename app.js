document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const chatMessages = document.getElementById('chat-messages');

    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
    });

    // Send message on Enter (without Shift)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    btnSend.addEventListener('click', sendMessage);

    // Modal Logic
    const diagnosticModal = document.getElementById('diagnostic-modal');
    const btnDiagnostic = document.getElementById('btn-diagnostic');
    const closeBtn = document.querySelector('.close-btn');
    const btnSubmitTest = document.getElementById('btn-submit-test');

    btnDiagnostic.addEventListener('click', () => {
        diagnosticModal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        diagnosticModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === diagnosticModal) {
            diagnosticModal.classList.remove('show');
        }
    });

    btnSubmitTest.addEventListener('click', () => {
        const selected = document.querySelector('input[name="q1"]:checked');
        if (selected) {
            diagnosticModal.classList.remove('show');
            appendMessage("Mình đã nộp bài test chẩn đoán.", "student");
            
            const thinkingId = appendThinking();
            setTimeout(() => {
                removeThinking(thinkingId);
                let responseText = "";
                if (selected.value === 'b') {
                    responseText = "Tuyệt vời! Constructor đúng là nơi khởi tạo đầu tiên của Form. Bạn nắm rất chắc lý thuyết cơ bản. Tiếp tục phát huy nhé!";
                } else {
                    responseText = "Rất tiếc, câu trả lời chưa chính xác. Khi một Form được khởi tạo, Constructor sẽ được gọi đầu tiên (như `public Form1()`), sau đó mới đến các sự kiện như `Form_Load` hay `Form_Shown`. Hãy lưu ý điểm này nhé!";
                }
                appendMessage(responseText, 'tutor');
            }, 1500);
        } else {
            alert("Vui lòng chọn một đáp án!");
        }
    });

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Add User Message
        appendMessage(text, 'student');
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 2. Mock AI Thinking Phase
        const thinkingId = appendThinking();

        // 3. Mock AI Response based on Adaptive Tutoring Rules
        setTimeout(() => {
            removeThinking(thinkingId);
            const response = generateAdaptiveResponse(text);
            appendMessage(response.text, 'tutor', response.citation);
        }, 1500 + Math.random() * 1000); // 1.5 - 2.5s delay
    }

    function appendMessage(text, sender, citation = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        let avatarIcon = sender === 'student' ? 'fa-user' : 'fa-robot';
        let bgClass = sender === 'student' ? '' : 'glass-message';

        let innerHTML = `
            <div class="avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="message-content ${bgClass}">
                <p>${text.replace(/\n/g, '<br>')}</p>
        `;

        if (citation) {
            innerHTML += `
                <div class="citation">
                    <i class="fa-solid fa-book-open"></i> Nguồn: ${citation}
                </div>
            `;
        }

        innerHTML += `</div>`;
        msgDiv.innerHTML = innerHTML;
        
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendThinking() {
        const id = 'thinking-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message tutor`;
        msgDiv.id = id;
        
        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content glass-message" style="display: flex; gap: 0.5rem; align-items: center; color: var(--text-secondary);">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Đang phân tích Student Model và Curriculum...
            </div>
        `;
        
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeThinking(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- MOCK AI TUTOR ENGINE ---
    // Rule: Không đưa đáp án hoàn chỉnh, kiểm tra prerequisite, giới hạn domain.
    function generateAdaptiveResponse(query) {
        const q = query.toLowerCase();

        // Domain restriction check
        if (q.includes('thơ tình') || q.includes('nấu ăn') || q.includes('thời tiết') || q.includes('bóng đá')) {
            return {
                text: "Xin lỗi, mình là AI Tutor chuyên biệt cho môn học WinForms. Mình chỉ có thể hỗ trợ bạn các câu hỏi liên quan đến lập trình C# và WinForms. Bạn có câu hỏi nào về môn học này không?"
            };
        }

        // Case 1: Asking for full code / solution directly
        if (q.includes('giải bài') || (q.includes('viết code') && q.includes('cho tao')) || (q.includes('làm bài') && q.includes('quản lý sinh viên'))) {
            return {
                text: "Mình hiểu bạn đang cần hoàn thiện bài tập này. Tuy nhiên, theo lộ trình học, việc cung cấp toàn bộ source code sẽ khiến bạn khó nắm vững kiến thức.\n\nThay vào đó, mình thấy bạn đang học phần **DataGridView**, chúng ta hãy đi từng bước nhé:\n1. Bạn đã thiết kế xong giao diện Form (kéo thả DataGridView, các TextBox) chưa?\n2. Bạn định dùng List hay DataTable để lưu dữ liệu tạm?\n\nHãy cho mình biết bạn đang vướng ở bước nào, mình sẽ hướng dẫn chi tiết đoạn đó."
            };
        }

        // Case 2: Event Handling (Student is weak in this: 45%)
        if (q.includes('không chạy') || q.includes('click') || q.includes('sự kiện') || q.includes('event')) {
            return {
                text: "Lỗi code không chạy khi click thường liên quan đến **Event Handling** (Xử lý sự kiện) – phần mà hệ thống ghi nhận bạn đang cần cải thiện thêm.\n\nBạn hãy kiểm tra 2 điểm sau:\n1. Hàm xử lý (ví dụ: `button1_Click`) đã được gán (subscribe) vào sự kiện `Click` của Button trong tab Properties (hình sấm sét) chưa?\n2. Trong file `.Designer.cs`, có dòng lệnh dạng `this.button1.Click += new System.EventHandler(this.button1_Click);` không?\n\nBạn kiểm tra thử nhé. Nguyên lý là: **Chỉ viết hàm thôi là chưa đủ, phải báo cho Form biết nút đó gắn với hàm nào.**",
                citation: "Chương 3 — Event & Form Lifecycle (Trang 27)"
            };
        }

        // Case 3: DataGridView (Student is very weak: 38% & Locked in Curriculum)
        if (q.includes('datagridview')) {
            return {
                text: "Bạn đang hỏi về **DataGridView**. Theo bản đồ kiến thức, phần này đòi hỏi bạn phải nắm chắc **Collection (List, mảng)** và **Event** trước.\n\nTuy nhiên, để thêm dữ liệu đơn giản nhất, bạn có thể tạo một `List<SinhVien>`, sau đó gán:\n\n<pre>dataGridView1.DataSource = null;\ndataGridView1.DataSource = danhSachSinhVien;</pre>\n\nBạn hãy thử đoạn code trên. Nếu danh sách không hiển thị, bạn có biết mình cần kiểm tra thuộc tính (Properties) nào của class SinhVien không?"
            };
        }

        // Default response for other WinForm queries
        return {
            text: "Đó là một câu hỏi hay. Dựa trên lịch sử học tập của bạn, mình gợi ý bạn nên xem lại cách hoạt động của vòng đời Form (Form Lifecycle). Bạn có muốn mình đưa ra một bài tập nhỏ để kiểm tra xem bạn đã hiểu phần này chưa không?",
            citation: "Giáo trình WinForms Cơ Bản (Trang 15)"
        };
    }
});
