"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Plus, Paperclip, Send, Bot, LogOut, Upload, X, Copy, Check, Info, 
  Eye, EyeOff, User, MessageSquare, BookOpen, Clock, ChevronDown, File, FileText,
  Home, Compass, PenTool, Search, Bell, ThumbsUp, ThumbsDown, ChevronRight, 
  RefreshCw, Layers, Layout, BookType, Hash, Settings, CheckCircle2
} from "lucide-react";

// --- CODE BLOCK ---
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
      <div className="my-4 rounded-xl border border-[#2a2c38] overflow-hidden bg-[#0d0f17]">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161822] border-b border-[#2a2c38] text-xs">
          <span className="font-bold text-blue-400 uppercase tracking-wider">{language}</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-[#888] hover:text-white transition-colors border border-[#2a2c38] px-2.5 py-1 rounded-md bg-[#1e2030] hover:bg-[#2a2c38]">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed">
          <code className={className} {...props} style={{ fontFamily: "'Consolas', 'Fira Code', monospace" }}>{children}</code>
        </div>
      </div>
    );
  }
  return <code className="bg-[#2a2c38] text-[#7dd3fc] px-1.5 py-0.5 rounded text-[0.88em] font-mono" {...props}>{children}</code>;
};

// --- MAIN ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  if (!isAuthenticated) return <LoginScreen onLoginSuccess={(u) => { setAuthUsername(u); setIsAuthenticated(true); }} />;
  return <Dashboard username={authUsername} onLogout={() => { setIsAuthenticated(false); setAuthUsername(""); }} />;
}

// --- LOGIN ---
function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { setUsername(""); setPassword(""); setError(""); }, [authMode]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/${authMode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok) onLoginSuccess(username);
      else setError(data.detail || "Đã có lỗi xảy ra");
    } catch { setError("Không thể kết nối đến máy chủ"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f111a]">
      <div className="w-full max-w-md p-8 bg-[#141620] border border-[#2a2c38] rounded-2xl shadow-2xl mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#03c896] to-[#4a5ee3] flex items-center justify-center mb-4 shadow-lg shadow-[#03c896]/20">
            <Bot size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI Tutor</h1>
          <p className="text-[#888] text-sm mt-1">WinForms Learning Assistant</p>
        </div>
        <h2 className="text-lg font-semibold text-white mb-6 text-center">{authMode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg text-center">{error}</div>}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#a0a0a0]">Tên đăng nhập</label>
            <input type="text" placeholder="Nhập tên đăng nhập..." className="w-full p-3 rounded-lg bg-[#181a25] border border-[#2a2c38] focus:border-[#03c896] text-white placeholder:text-[#555] transition-colors" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#a0a0a0]">Mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu..." className="w-full p-3 pr-10 rounded-lg bg-[#181a25] border border-[#2a2c38] focus:border-[#03c896] text-white placeholder:text-[#555] transition-colors" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"><Eye size={18} /></button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#03c896] to-[#02b385] hover:opacity-90 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-[#03c896]/20">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (authMode === "login" ? "Đăng nhập" : "Đăng ký")}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-[#888]">
          {authMode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="text-[#03c896] hover:text-white font-medium transition-colors">{authMode === "login" ? "Đăng ký ngay" : "Đăng nhập"}</button>
        </div>
      </div>
    </div>
  );
}

// --- SIDEBAR NAV ---
const SideNavItem = ({ icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${active ? 'bg-[#1e2030] text-white' : 'text-[#8888a0] hover:text-white hover:bg-[#1e2030]/50'}`}>
    {icon}<span>{label}</span>
  </button>
);

// --- HISTORY ITEM ---
const HistoryItem = ({ title, time, active }) => (
  <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${active ? 'bg-[#1e2030] border border-[#2a2c38]' : 'hover:bg-[#1e2030]/40'}`}>
    <div className="flex items-center gap-2.5 overflow-hidden">
      <MessageSquare size={15} className={`shrink-0 ${active ? 'text-[#03c896]' : 'text-[#555] group-hover:text-[#888]'}`} />
      <span className={`text-[13px] truncate ${active ? 'text-white font-medium' : 'text-[#8888a0] group-hover:text-[#c0c0c0]'}`}>{title}</span>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[10px] text-[#555]">{time}</span>
      {active && <CheckCircle2 size={14} className="text-[#03c896]" />}
    </div>
  </button>
);

// --- KNOWLEDGE CARD ---
const KnowledgeCard = ({ icon, bgColor, textColor, title, sub }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181a25] border border-[#2a2c38] hover:border-[#3a3c48] cursor-pointer transition-all group">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>{icon}</div>
    <div className="overflow-hidden">
      <h4 className={`text-sm font-semibold truncate transition-colors ${textColor}`}>{title}</h4>
      <p className="text-[11px] text-[#666] truncate">{sub}</p>
    </div>
  </div>
);

// --- SUGGEST BTN ---
const SuggestBtn = ({ text, onClick }) => (
  <button onClick={() => onClick?.(text)} className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#181a25] border border-[#2a2c38] hover:border-[#4a5ee3]/50 hover:bg-[#4a5ee3]/5 text-left transition-all group">
    <span className="text-[12.5px] text-[#8888a0] group-hover:text-[#c0c0c0] truncate pr-2 leading-snug">{text}</span>
    <ChevronRight size={14} className="text-[#555] group-hover:text-[#4a5ee3] shrink-0 transition-colors" />
  </button>
);

// --- PROGRESS ---
const ProgressItem = ({ name, pct, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-[12.5px] text-[#8888a0] w-28 truncate shrink-0">{name}</span>
    <div className="flex-1 h-2 bg-[#1e2030] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
    <span className="text-[12px] text-[#666] font-mono w-8 text-right shrink-0">{pct}%</span>
  </div>
);

// --- DASHBOARD ---
function Dashboard({ username, onLogout }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('new');
  const [toast, setToast] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/history?student_id=${username}`);
        const data = await res.json();
        if (res.ok && data.status === "success" && data.history?.length > 0) {
          setHistoryItems([{ id: 'full-history', title: 'Hướng dẫn xử lý sự kiện...', time: '20:15' }]);
        }
      } catch {}
    })();
  }, [username]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 5000); };

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`; }
  }, [input]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const processFiles = useCallback((files) => {
    const newAtts = [];
    for (const f of files) {
      if (attachments.some(a => a.name === f.name)) continue;
      const isImg = f.type.startsWith("image/");
      newAtts.push({ file: f, name: f.name, size: f.size, type: isImg ? "image" : "file", preview: isImg ? URL.createObjectURL(f) : null });
    }
    setAttachments(prev => [...prev, ...newAtts]);
  }, [attachments]);

  const fileToBase64 = (f) => new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(f); r.onload = () => res(r.result); r.onerror = rej; });

  const handleSend = async (overrideText = null) => {
    const text = (overrideText ?? input).trim();
    if (!text && !attachments.length) return;
    
    const userMsg = { id: Date.now(), sender: "student", text, attachments: attachments.map(a => ({ name: a.name, type: a.type, preview: a.preview })), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    
    let apiMsg = text;
    if (attachments.length) { const names = attachments.map(a => a.name).join(", "); apiMsg = text ? `${text}\n\n[Đính kèm: ${names}]` : `[Đính kèm: ${names}]`; }
    if (overrideText === null) setInput("");
    setIsTyping(true);
    if (currentSessionId === 'new') { setCurrentSessionId('active'); if (!historyItems.length) setHistoryItems([{ id: 'full-history', title: text.substring(0, 25) + '...', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); }
    const curAtts = [...attachments]; setAttachments([]);

    try {
      const imgs = [];
      for (const a of curAtts) { if (a.type === 'image') imgs.push(await fileToBase64(a.file)); else { const fd = new FormData(); fd.append("file", a.file); await fetch("http://localhost:8000/api/upload", { method: "POST", body: fd }).catch(() => {}); } }
      const res = await fetch("http://localhost:8000/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: apiMsg, student_id: username, images: imgs }) });
      const data = await res.json();
      if (data.status === "error") {
        let em = "Hệ thống đang quá tải. Vui lòng thử lại sau.";
        if (data.text?.includes("504") || data.text?.includes("DEADLINE")) em = "⏳ Phản hồi quá lâu. Server quá tải. Vui lòng thử lại.";
        else if (data.text?.includes("429") || data.text?.includes("RESOURCE_EXHAUSTED")) em = "🛑 Giới hạn API Google. Vui lòng đợi 1-2 phút.";
        else em = "⚠️ " + data.text;
        showToast(em);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "tutor", text: data.text, citation: data.citation, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
    } catch { showToast("🔌 Mất kết nối máy chủ. Kiểm tra lại mạng."); }
    finally { setIsTyping(false); }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0f111a] text-[#e0e0e0] overflow-hidden"
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
      onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) processFiles(Array.from(e.dataTransfer.files)); }}
    >
      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
          <div className="bg-[#1e2030] border border-red-500/40 shadow-2xl shadow-red-900/30 px-5 py-3 rounded-2xl flex items-center gap-3 max-w-lg">
            <Info size={18} className="text-red-400 shrink-0" />
            <span className="text-sm text-[#e0e0e0]">{toast}</span>
            <button onClick={() => setToast(null)} className="text-[#666] hover:text-white ml-2"><X size={15} /></button>
          </div>
        </div>
      )}

      {/* ========== LEFT SIDEBAR ========== */}
      <aside className="hidden md:flex w-[272px] bg-[#141620] border-r border-[#2a2c38] flex-col h-full shrink-0">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a5ee3] to-[#7b61ff] flex items-center justify-center shadow-lg shadow-[#4a5ee3]/20">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] text-white tracking-tight">AI Tutor</span>
            </div>
            <span className="text-[10px] text-[#03c896] font-bold uppercase tracking-[0.15em]">WinForms &nbsp;Beta</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-5">
          <button onClick={() => { setMessages([]); setCurrentSessionId('new'); setInput(""); }} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#03c896] to-[#02a87d] hover:from-[#02b385] hover:to-[#029972] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#03c896]/15 text-[13.5px]">
            <Plus size={18} strokeWidth={2.5} /> Cuộc trò chuyện mới
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="px-3 space-y-0.5">
          <SideNavItem icon={<Home size={18} />} label="Trang chủ" active />
          <SideNavItem icon={<Compass size={18} />} label="Khám phá kiến thức" />
          <SideNavItem icon={<PenTool size={18} />} label="Bài tập & Thực hành" />
          <SideNavItem icon={<User size={18} />} label="Hồ sơ học tập" />
        </nav>

        {/* History */}
        <div className="flex-1 overflow-y-auto mt-5 px-3 custom-scrollbar">
          <h3 className="text-[10px] text-[#555] font-bold mb-3 px-3 uppercase tracking-[0.2em]">Lịch sử hội thoại</h3>
          
          {/* Today */}
          <div className="mb-3">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-semibold text-[#8888a0]">Hôm nay</span>
              <ChevronDown size={13} className="text-[#555]" />
            </div>
            <div className="space-y-0.5">
              {historyItems.map(item => (
                <HistoryItem key={item.id} title={item.title} time={item.time} active />
              ))}
              <HistoryItem title="Cách dùng DataGridView" time="19:42" />
              <HistoryItem title="Lỗi kết nối SQL" time="17:30" />
              <HistoryItem title="Giải thích OOP trong C#" time="14:22" />
            </div>
          </div>

          {/* Yesterday */}
          <div className="mb-3">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-semibold text-[#8888a0]">Hôm qua</span>
              <ChevronDown size={13} className="text-[#555]" />
            </div>
            <div className="space-y-0.5">
              <HistoryItem title="Tạo form đăng nhập" time="21:10" />
              <HistoryItem title="Giải thích ADO.NET" time="16:08" />
              <HistoryItem title="Ví dụ validation" time="10:35" />
            </div>
          </div>

          {/* 7 days ago */}
          <div className="mb-3">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-semibold text-[#8888a0]">7 ngày trước</span>
              <ChevronDown size={13} className="text-[#555]" />
            </div>
            <div className="space-y-0.5">
              <HistoryItem title="So sánh List và BindingList" time="12/09" />
              <HistoryItem title="Form Navigation" time="11/09" />
            </div>
          </div>
        </div>
        
        {/* Profile */}
        <div className="px-4 py-3 border-t border-[#2a2c38]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onLogout}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a5ee3] to-[#7b61ff] flex items-center justify-center font-bold text-sm text-white shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">{username}</p>
                <p className="text-[11px] text-[#666]">Sinh viên</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-[#1e2030] transition-colors"><Settings size={16} /></button>
              <button onClick={onLogout} className="p-1.5 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-400/10 transition-colors"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CHAT ========== */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#181a25]">
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-[#181a25]/90 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-[#4a5ee3] m-4 rounded-2xl">
            <Upload size={48} className="text-[#4a5ee3] mb-4 animate-bounce" /><h3 className="text-xl font-bold text-white">Thả tài liệu vào đây</h3>
          </div>
        )}

        {/* Header */}
        <header className="h-[56px] flex items-center justify-between px-5 shrink-0 border-b border-[#2a2c38] bg-[#141620]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4a5ee3]/15 flex items-center justify-center border border-[#4a5ee3]/25">
              <BookOpen size={16} className="text-[#4a5ee3]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-[14px] leading-tight">AI Tutor - WinForms</h2>
              <p className="text-[11px] text-[#666] leading-tight">Học WinForms theo cách của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/8 text-[11px] font-semibold text-green-400 tracking-wide">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-glow" /> AI Online
            </div>
            <Search size={17} className="text-[#555] cursor-pointer hover:text-white transition-colors" />
            <Bell size={17} className="text-[#555] cursor-pointer hover:text-white transition-colors" />
            <div className="flex items-center gap-2 cursor-pointer pl-2 border-l border-[#2a2c38]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4a5ee3] to-[#7b61ff] flex items-center justify-center font-bold text-[11px] text-white">{username.charAt(0).toUpperCase()}</div>
              <span className="text-[13px] font-medium text-[#c0c0c0] hidden sm:block">{username}</span>
              <ChevronDown size={13} className="text-[#555]" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#4a5ee3]/10 flex items-center justify-center mb-5 border border-[#4a5ee3]/20">
                <Bot size={34} className="text-[#4a5ee3]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Tutor WinForms</h2>
              <p className="text-[#8888a0] mb-8 text-[15px]">Học Lập trình WinForms theo cách của bạn.</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { t: "Giải thích Event Handling", d: "Cách hoạt động của sự kiện trong WinForms" },
                  { t: "Phân tích đoạn code C#", d: "Dán code bị lỗi vào đây để tìm cách sửa" },
                  { t: "Giúp tôi hiểu DataGridView", d: "Cách hiển thị và kết nối dữ liệu" },
                  { t: "Kiểm tra kiến thức của tôi", d: "Cho tôi một bài tập nhỏ về WinForms" }
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s.t)} className="p-4 bg-[#141620] hover:bg-[#1e2030] border border-[#2a2c38] hover:border-[#4a5ee3]/40 rounded-xl text-left transition-all group">
                    <span className="text-[13px] font-semibold text-[#c0c0c0] group-hover:text-white block mb-1">{s.t}</span>
                    <span className="text-[11px] text-[#666]">{s.d}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-6">
              {messages.map(msg => (
                <div key={msg.id} className={`flex w-full animate-fade-in ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "tutor" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a5ee3] to-[#7b61ff] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-md shadow-[#4a5ee3]/20">
                      <Bot size={20} className="text-white" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1.5 ${msg.sender === "student" ? "items-end max-w-[80%]" : "items-start flex-1 min-w-0"}`}>
                    {msg.sender === "student" && (
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-end gap-2">
                          {msg.attachments?.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-end">
                              {msg.attachments.map((att, i) => (
                                <div key={i} className="flex items-center gap-2 bg-[#2a2c38] rounded-lg px-3 py-2"><File size={14} className="text-[#888]" /><span className="text-xs text-[#c0c0c0]">{att.name}</span></div>
                              ))}
                            </div>
                          )}
                          {msg.text && (
                            <div className="px-4 py-3 bg-gradient-to-r from-[#4a5ee3] to-[#5a6eef] text-white rounded-2xl rounded-tr-md text-[14px] leading-relaxed shadow-lg shadow-[#4a5ee3]/20">
                              {msg.text}
                            </div>
                          )}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a5ee3] to-[#7b61ff] flex items-center justify-center font-bold text-[12px] text-white shrink-0 shadow-md mt-1">
                          {username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    {msg.sender === "tutor" && (
                      <div className="w-full">
                        <div className="markdown-body"><ReactMarkdown components={{ code: CodeBlock }}>{msg.text}</ReactMarkdown></div>
                        {msg.citation && (
                          <div className="mt-5 pt-4 border-t border-[#2a2c38]">
                            <p className="text-[11px] text-[#666] mb-3 font-medium uppercase tracking-wider">Tài liệu tham khảo:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.citation.split(',').map((src, i) => (
                                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141620] border border-[#2a2c38] hover:border-[#3a3c48] cursor-pointer transition-colors group">
                                  <div className="w-9 h-9 rounded-lg bg-[#4a5ee3]/15 text-[#4a5ee3] flex items-center justify-center shrink-0"><FileText size={16} /></div>
                                  <div className="pr-2">
                                    <h4 className="text-[12px] font-semibold text-[#c0c0c0] group-hover:text-white truncate max-w-[160px]">{src.trim()}</h4>
                                    <p className="text-[10px] text-[#555]">Tài liệu hệ thống</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-3">
                          <button className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-[#1e2030] transition-colors"><ThumbsUp size={15} /></button>
                          <button className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-[#1e2030] transition-colors"><ThumbsDown size={15} /></button>
                          <button className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-[#1e2030] transition-colors"><Copy size={15} /></button>
                          <button className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-[#1e2030] transition-colors"><RefreshCw size={15} /></button>
                        </div>
                      </div>
                    )}
                    <span className={`text-[10px] text-[#555] ${msg.sender === "student" ? "mr-12" : ""}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a5ee3] to-[#7b61ff] flex items-center justify-center shrink-0 shadow-md"><Bot size={20} className="text-white" /></div>
                  <div className="flex items-center gap-1.5 py-3">
                    {[0, 0.15, 0.3].map((d, i) => <div key={i} className="w-2 h-2 bg-[#4a5ee3] rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-4 sm:px-6 lg:px-8 pb-5 pt-1 shrink-0">
          <div className="max-w-3xl mx-auto">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 px-2">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#1e2030] border border-[#2a2c38] rounded-lg px-3 py-1.5">
                    <File size={13} className="text-[#888]" /><span className="text-[11px] text-[#c0c0c0] truncate max-w-[100px]">{a.name}</span>
                    <button onClick={() => setAttachments(p => p.filter((_, j) => j !== i))} className="text-[#555] hover:text-red-400"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-[#141620] rounded-full flex items-center border border-[#2a2c38] focus-within:border-[#4a5ee3]/60 shadow-xl shadow-black/20 transition-all pl-1 pr-1.5 py-1 gap-1">
              <input type="file" ref={fileInputRef} onChange={e => { if (e.target.files) processFiles(Array.from(e.target.files)); e.target.value = ""; }} className="hidden" multiple />
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full text-[#555] hover:text-white hover:bg-[#1e2030] transition-colors shrink-0">
                <Paperclip size={18} />
              </button>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Nhập câu hỏi về WinForms..."
                className="flex-1 bg-transparent text-[#e0e0e0] outline-none resize-none placeholder:text-[#555] text-[14px] leading-normal py-2 min-h-[24px] max-h-[120px]" rows={1} />
              <span className="text-[10px] text-[#444] hidden sm:block whitespace-nowrap shrink-0 mr-1">Shift + Enter để xuống dòng</span>
              <button onClick={() => handleSend(null)} disabled={!input.trim() && !attachments.length}
                className="w-9 h-9 rounded-full bg-[#03c896] text-white flex items-center justify-center hover:bg-[#02b385] disabled:bg-[#1e2030] disabled:text-[#555] transition-all shadow-md shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ========== RIGHT SIDEBAR ========== */}
      <aside className="hidden xl:flex w-[300px] bg-[#141620] border-l border-[#2a2c38] flex-col h-full shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-7">
          {/* Knowledge */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[#4a5ee3] font-bold text-[12px] uppercase tracking-[0.12em]"><Layers size={15} /> Kiến thức liên quan</div>
              <span className="text-[11px] text-[#4a5ee3] cursor-pointer hover:underline font-medium">Xem tất cả</span>
            </div>
            <div className="space-y-2.5">
              <KnowledgeCard icon={<Layout size={18} />} bgColor="bg-red-500/15" textColor="text-[#03c896] group-hover:text-white" title="Event Handling" sub="Chương 3 • Trang 24-28" />
              <KnowledgeCard icon={<Hash size={18} />} bgColor="bg-purple-500/15" textColor="text-purple-400 group-hover:text-white" title="Button Control" sub="Chương 2 • Trang 15-18" />
              <KnowledgeCard icon={<Layout size={18} />} bgColor="bg-teal-500/15" textColor="text-teal-400 group-hover:text-white" title="Form và Controls" sub="Chương 2 • Trang 10-14" />
              <KnowledgeCard icon={<MessageSquare size={18} />} bgColor="bg-red-500/15" textColor="text-red-400 group-hover:text-white" title="MessageBox" sub="Chương 4 • Trang 32-34" />
            </div>
          </section>

          {/* Suggest */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-yellow-500 font-bold text-[12px] uppercase tracking-[0.12em]"><PenTool size={15} /> Gợi ý câu hỏi</div>
              <RefreshCw size={14} className="text-[#555] cursor-pointer hover:text-white transition-colors" />
            </div>
            <div className="space-y-2">
              <SuggestBtn text="Làm thế nào để lấy giá trị từ TextBox khi nhấn nút?" onClick={handleSend} />
              <SuggestBtn text="Cách kiểm tra dữ liệu nhập trước khi xử lý?" onClick={handleSend} />
              <SuggestBtn text="Sự khác nhau giữa Click và MouseClick?" onClick={handleSend} />
              <SuggestBtn text="Ví dụ xử lý nhiều sự kiện trong một Form" onClick={handleSend} />
              <SuggestBtn text="Làm sao để tắt nút sau khi click?" onClick={handleSend} />
            </div>
          </section>

          {/* Progress */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-green-400 font-bold text-[12px] uppercase tracking-[0.12em]"><BookType size={15} /> Chủ đề đang học</div>
              <span className="text-[11px] text-[#4a5ee3] cursor-pointer hover:underline font-medium">Xem lộ trình</span>
            </div>
            <div className="space-y-3.5">
              <ProgressItem name="C# cơ bản" pct={85} color="bg-teal-400" />
              <ProgressItem name="OOP" pct={72} color="bg-blue-400" />
              <ProgressItem name="WinForms" pct={65} color="bg-indigo-400" />
              <ProgressItem name="Event Handling" pct={40} color="bg-yellow-400" />
              <ProgressItem name="DataGridView" pct={28} color="bg-red-400" />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
