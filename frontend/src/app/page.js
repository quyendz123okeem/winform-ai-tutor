"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Home, MessageSquare, BookOpen, GraduationCap, TrendingUp,
  Code, Layout, MousePointerClick, Table, Database,
  File, FileText, Clock, Bell, Sun, Moon,
  Plus, Paperclip, Image as ImageIcon, Send, Bot, CheckCircle,
  LogOut, Upload, X, ChevronDown, Bookmark, Copy, Check
} from "lucide-react";

// Tùy chỉnh Code Block cho ReactMarkdown
const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="my-4 rounded-xl overflow-hidden border border-[#334155] bg-[#0d1117]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#334155]">
          <span className="text-xs font-mono text-[#8b949e] uppercase">{language}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 overflow-x-auto custom-scrollbar">
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    );
  }

  return (
    <code className="bg-[#1e293b] text-[#e2e8f0] px-1.5 py-0.5 rounded-md text-[0.85em] font-mono" {...props}>
      {children}
    </code>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // login or register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // MOCK DATA for Dashboard
  const subjects = [
    { name: "C# Cơ bản", icon: <Code size={18}/>, progress: 85, color: "#10b981" },
    { name: "WinForms", icon: <Layout size={18}/>, progress: 80, color: "#3b82f6" },
    { name: "Event Handling", icon: <MousePointerClick size={18}/>, progress: 45, color: "#f59e0b" },
    { name: "DataGridView", icon: <Table size={18}/>, progress: 38, color: "#ef4444" },
    { name: "ADO.NET", icon: <Database size={18}/>, progress: 20, color: "#8b5cf6" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError(data.detail || "Đã có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-purple-500 flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
              <GraduationCap size={32} color="white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {authMode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              Hệ thống AI Tutor môn WinForms
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col mt-4">
            {error && <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</div>}
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tên đăng nhập" 
                className="auth-input pl-12"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="Mật khẩu" 
                className="auth-input pl-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-purple-600 text-white font-semibold shadow-lg shadow-[var(--accent-glow)] hover:opacity-90 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (authMode === "login" ? "Đăng Nhập" : "Đăng Ký")}
            </button>
          </form>

          <p className="text-[var(--text-secondary)] text-sm mt-2">
            {authMode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button 
              onClick={() => {setAuthMode(authMode === "login" ? "register" : "login"); setError("");}}
              className="text-[var(--accent-primary)] hover:text-white font-medium transition-colors"
            >
              {authMode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard username={username} onLogout={() => setIsAuthenticated(false)} subjects={subjects} />;
}

function Dashboard({ username, onLogout, subjects }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "tutor", text: `Xin chào **${username}**! 👋

Mình là AI Tutor môn WinForms. Mình có thể giúp bạn:

- Giải thích kiến thức theo chương trình học
- Hướng dẫn làm bài tập từng bước
- Phân tích và sửa lỗi code
- Đề xuất bài tập phù hợp với trình độ

Bạn muốn bắt đầu với nội dung gì hôm nay?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const processFiles = useCallback((files) => {
    const newAttachments = [];
    for (const file of files) {
      if (attachments.some(a => a.name === file.name)) continue;
      const isImage = file.type.startsWith("image/");
      const attachment = {
        file,
        name: file.name,
        size: file.size,
        type: isImage ? "image" : "file",
        preview: isImage ? URL.createObjectURL(file) : null
      };
      newAttachments.push(attachment);
    }
    setAttachments(prev => [...prev, ...newAttachments]);
  }, [attachments]);

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      processFiles(files);
    }
  }, [processFiles]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    
    const userMsg = { 
      id: Date.now(), 
      sender: "student", 
      text: input.trim(),
      attachments: attachments.map(a => ({ name: a.name, type: a.type, preview: a.preview }))
    };
    setMessages(prev => [...prev, userMsg]);
    
    let apiMessage = input.trim();
    if (attachments.length > 0) {
      const fileNames = attachments.map(a => a.name).join(", ");
      apiMessage = apiMessage ? `${apiMessage}\n\n[Đính kèm: ${fileNames}]` : `[Đính kèm: ${fileNames}]`;
    }

    setInput("");
    setIsTyping(true);
    setAttachments([]); // Clear attachments UI instantly

    try {
      // 1. Convert images to base64 & upload documents
      const base64Images = [];
      for (const att of attachments) {
        if (att.type === 'image') {
          try {
            const b64 = await fileToBase64(att.file);
            base64Images.push(b64);
          } catch (e) {
            console.error("Image encode failed", e);
          }
        } else {
          const formData = new FormData();
          formData.append("file", att.file);
          try {
            await fetch("http://localhost:8000/api/upload", { method: "POST", body: formData });
          } catch (err) {
            console.error("Upload failed", err);
          }
        }
      }

      // 2. Chat logic
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: apiMessage, 
          student_id: username,
          images: base64Images 
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now()+1, sender: "tutor", text: data.text, citation: data.citation }]);
    } catch(err) {
      setMessages(prev => [...prev, { id: Date.now()+1, sender: "tutor", text: "Lỗi kết nối đến máy chủ." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="flex h-screen w-screen bg-[#0b0f19] text-[#94a3b8] font-sans overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-[300px] min-w-[300px] bg-[#0b0f19] border-r border-[#1e293b] flex flex-col h-full shrink-0">
        
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-lg leading-tight truncate">AI Tutor</h1>
            <p className="text-xs text-[#94a3b8] truncate">WinForms Cơ Bản</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          
          {/* Section: Học tập */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-[#64748b] mb-3 px-2 uppercase tracking-wider">Học tập</h3>
            <div className="space-y-1">
              <SidebarItem icon={<Home size={18}/>} label="Trang chủ" />
              <SidebarItem icon={<MessageSquare size={18}/>} label="Chat học tập" active />
              <SidebarItem icon={<FileText size={18}/>} label="Bài tập" />
              <SidebarItem icon={<BookOpen size={18}/>} label="Kiến thức" />
              <SidebarItem icon={<TrendingUp size={18}/>} label="Tiến độ" />
            </div>
          </div>

          {/* Section: Chủ đề */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-[#64748b] mb-3 px-2 uppercase tracking-wider">Chủ đề</h3>
            <div className="space-y-3 px-2">
              {subjects.map((sub, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#cbd5e1] truncate max-w-[180px]">
                      <span style={{color: sub.color}} className="shrink-0">{sub.icon}</span>
                      <span className="truncate">{sub.name}</span>
                    </div>
                    <span className="text-xs text-[#64748b] shrink-0">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Tiện ích */}
          <div>
            <h3 className="text-xs font-semibold text-[#64748b] mb-3 px-2 uppercase tracking-wider">Tiện ích</h3>
            <div className="space-y-1">
              <SidebarItem icon={<File size={18}/>} label="Tài liệu của tôi" />
              <SidebarItem icon={<Code size={18}/>} label="Code của tôi" />
              <SidebarItem icon={<Clock size={18}/>} label="Lịch sử hội thoại" />
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#1e293b] shrink-0">
          <div className="flex items-center justify-between bg-[#151b2b] p-3 rounded-xl border border-[#1e293b] cursor-pointer hover:bg-[#1e293b] transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium leading-tight truncate max-w-[120px]">{username}</p>
                <p className="text-xs text-[#64748b]">Sinh viên</p>
              </div>
            </div>
            <LogOut size={16} className="text-[#64748b] hover:text-red-400 shrink-0" onClick={onLogout} />
          </div>
        </div>

      </div>

      {/* ================= MAIN CHAT AREA ================= */}
      <div className="flex-1 flex flex-col h-full bg-[#0b0f19] relative min-w-0">
        
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-[#0b0f19]/80 backdrop-blur-sm border-2 border-dashed border-[#6366f1] flex flex-col items-center justify-center text-white">
            <Upload size={48} className="text-[#6366f1] mb-4" />
            <h3 className="text-2xl font-bold">Thả file vào đây</h3>
            <p className="text-[#94a3b8] mt-2">Hỗ trợ PDF, DOCX, TXT, Code (.cs)...</p>
          </div>
        )}

        {/* Header */}
        <div className="h-[72px] border-b border-[#1e293b] flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-white font-bold text-xl">Chat học tập</h2>
            <p className="text-sm text-[#64748b] hidden sm:block">AI Tutor đồng hành cùng bạn học WinForms</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => { if(e.target.files) processFiles(Array.from(e.target.files)); e.target.value=""; }} 
            className="hidden" 
            multiple 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#334155]"
          >
            <Plus size={16} /> Tài liệu mới <Upload size={14} className="ml-1" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-10">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                
                {msg.sender === "tutor" && (
                  <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 mt-1 border border-[#334155]">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 ${msg.sender === "student" ? "items-end max-w-[75%]" : "items-start flex-1 min-w-0"}`}>
                  
                  {/* Attachments preview in message */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1 justify-end">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] px-3 py-1.5 rounded-xl">
                          {att.type === 'image' && att.preview ? (
                            <img src={att.preview} alt="upload" className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <File size={16} className="text-[#6366f1]" />
                          )}
                          <span className="text-xs text-[#e2e8f0] truncate max-w-[150px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.text && (
                    <div className={`text-[0.95rem] leading-relaxed w-full ${
                      msg.sender === "student" 
                        ? "px-5 py-3.5 bg-[#1e293b] text-[#f8fafc] rounded-2xl rounded-tr-sm border border-[#334155] w-fit ml-auto break-words" 
                        : "text-[#e2e8f0]"
                    }`}>
                      <div className={msg.sender === "tutor" ? "markdown-body w-full overflow-hidden" : "whitespace-pre-wrap font-sans"}>
                        {msg.sender === "tutor" ? (
                          <ReactMarkdown components={{ code: CodeBlock }}>{msg.text}</ReactMarkdown>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  )}
                  
                  {msg.citation && (
                    <div className="flex items-center justify-between w-full mt-1 bg-[#151b2b] border border-[#1e293b] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                        <BookOpen size={14} className="text-[#6366f1]" />
                        <span>Nguồn: {msg.citation}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#64748b]">
                        <button className="hover:text-white transition-colors"><FileText size={14}/></button>
                        <button className="hover:text-white transition-colors"><Bookmark size={14}/></button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 mt-1 border border-[#334155]">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="py-2.5 text-sm text-[#94a3b8] flex items-center gap-2 font-medium">
                  AI is thinking
                  <span className="flex gap-1 items-end h-4">
                    <div className="w-1 h-1 bg-[#94a3b8] rounded-full typing-dot" style={{animationDelay: "0ms"}}></div>
                    <div className="w-1 h-1 bg-[#94a3b8] rounded-full typing-dot" style={{animationDelay: "200ms"}}></div>
                    <div className="w-1 h-1 bg-[#94a3b8] rounded-full typing-dot" style={{animationDelay: "400ms"}}></div>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Box */}
        <div className="p-4 sm:p-6 pt-2 shrink-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Attachment Previews Area */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 px-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] pr-2 pl-3 py-1.5 rounded-lg group relative shadow-sm">
                    {att.type === 'image' && att.preview ? (
                      <img src={att.preview} alt="preview" className="w-6 h-6 object-cover rounded" />
                    ) : (
                      <File size={14} className="text-[#6366f1]" />
                    )}
                    <span className="text-xs text-[#cbd5e1] max-w-[120px] truncate">{att.name}</span>
                    <button 
                      onClick={() => removeAttachment(i)}
                      className="text-[#64748b] hover:text-red-400 p-0.5 rounded-full hover:bg-[#334155]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#1e293b]/70 backdrop-blur-md border border-[#334155] rounded-2xl flex flex-col focus-within:border-[#6366f1] focus-within:bg-[#1e293b] transition-all overflow-hidden shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn... (Shift + Enter để xuống dòng)"
                className="w-full bg-transparent text-white px-5 py-4 outline-none resize-none placeholder:text-[#64748b] text-[0.95rem] custom-scrollbar"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex gap-1">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-colors"
                    title="Đính kèm file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-colors"
                    title="Gửi ảnh"
                  >
                    <ImageIcon size={18} />
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() && attachments.length === 0}
                  className="w-9 h-9 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:opacity-40 disabled:bg-[#334155] disabled:text-[#64748b] transition-colors"
                >
                  <Send size={16} className="translate-x-[1px] translate-y-[1px]" />
                </button>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#64748b] mt-3">
              AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>


      
    </div>
  );
}

function SidebarItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
      active 
        ? "bg-[#6366f1]/10 text-[#6366f1] font-medium" 
        : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
    }`}>
      {icon}
      <span className="text-sm truncate">{label}</span>
    </div>
  );
}
