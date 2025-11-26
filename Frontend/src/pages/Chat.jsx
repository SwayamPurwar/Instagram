import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext.jsx";

export default function Chat() {
  const { receiverId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isFirstLoad = useRef(true);
  const typingTimeoutRef = useRef(null);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { navigate("/login"); return; }
    setCurrentUser(JSON.parse(storedUser));
    const newSocket = io(API_URL, { withCredentials: true });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (receiverId) {
      isFirstLoad.current = true;
      axios.get(`${API_URL}/users/${receiverId}`, { withCredentials: true }).then(res => setReceiver(res.data.user));
    }
  }, [receiverId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("getOnlineUsers", (users) => setOnlineUsers(users));
    socket.on("message", (msg) => {
      if (msg.sender === receiverId || msg.receiver === receiverId) {
        setMessages((prev) => [...prev, { text: msg.text, attachment: msg.attachment, attachmentType: msg.attachmentType, sender: msg.sender === currentUser?._id ? "me" : "them", read: false }]);
        if (msg.sender === receiverId) socket.emit("markRead", { senderId: receiverId });
      }
    });
    socket.on("typing", (data) => { if (data.sender === receiverId) setIsTyping(true); });
    socket.on("stopTyping", (data) => { if (data.sender === receiverId) setIsTyping(false); });
    socket.on("messageRead", (data) => { if (data.reader === receiverId) setMessages(prev => prev.map(m => ({ ...m, read: true }))); });
  }, [socket, receiverId, currentUser]);

  useEffect(() => {
    if (!receiverId || !currentUser) return;
    setMessages([]);
    axios.get(`${API_URL}/chat/chat-history/${currentUser.id}/${receiverId}?limit=5000`, { withCredentials: true }).then((res) => {
      const formatted = res.data.chatHistory.map((msg) => ({ text: msg.text, attachment: msg.attachment, attachmentType: msg.attachmentType, sender: String(msg.sender) === String(currentUser.id) ? "me" : "them", read: msg.read }));
      setMessages(formatted.reverse());
    });
  }, [receiverId, currentUser]);

  useEffect(() => {
    if (!receiverId && currentUser) {
      setLoadingConvos(true);
      axios.get(`${API_URL}/chat/conversations`, { withCredentials: true }).then((res) => setConversations(res.data.conversations || [])).finally(() => setLoadingConvos(false));
    }
  }, [receiverId, currentUser]);

  // --- ROBUST SCROLL LOGIC ---
  useEffect(() => {
    if (messagesEndRef.current) {
        if (isFirstLoad.current) {
            // Small delay to ensure DOM paint
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            }, 100);
            if (messages.length > 0) isFirstLoad.current = false;
        } else {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && receiverId) {
        socket.emit("typing", { receiver: receiverId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { socket.emit("stopTyping", { receiver: receiverId }); }, 2000);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault(); if (!input.trim()) return;
    socket.emit("message", { receiver: receiverId, message: input });
    socket.emit("stopTyping", { receiver: receiverId });
    setMessages((prev) => [...prev, { text: input, sender: "me", read: false }]);
    setInput("");
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_URL}/chat/upload`, formData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
      socket.emit("message", { receiver: receiverId, message: "", attachment: res.data.url, attachmentType: res.data.type });
      setMessages((prev) => [...prev, { text: "", attachment: res.data.url, attachmentType: res.data.type, sender: "me", read: false }]);
    } catch (error) { addToast("Failed to send file", "error"); } 
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const clearActiveChat = () => {
    if (!window.confirm("Delete chat?")) return;
    axios.delete(`${API_URL}/chat/chat-history/${receiverId}`, { withCredentials: true }).then(() => setMessages([]));
  };

  const isReceiverOnline = onlineUsers.includes(receiverId);

  if (!receiverId) {
    return (
      <div className="container page-enter">
        <div className="card">
          <div style={{ padding: "24px", borderBottom: "1px solid var(--glass-border)", display: 'flex', justifyContent: 'space-between', alignItems:'center' }}><h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Messages</h1></div>
          {!loadingConvos && conversations.map((convo) => (
            <div key={convo._id} style={{position: 'relative', borderBottom: "1px solid var(--glass-border)"}}>
                <Link to={`/chat/${convo.userDetails._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="notification-item" style={{borderRadius: 0, background: 'transparent', border: 'none'}}>
                    <img src={convo.userDetails.image || "https://via.placeholder.com/50"} className="chat-avatar" />
                    <div style={{flex: 1, minWidth: 0}}><div style={{ fontWeight: "700", marginBottom: '4px' }}>{convo.userDetails.username}</div><div className="muted">{convo.lastMessage}</div></div>
                </div>
                </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-screen page-enter">
      <div className="chat-header">
        <div className="chat-user-info">
          <Link to="/chat" className="btn-ghost" style={{ padding: '8px', fontSize: '1.2rem' }}>←</Link>
          <Link to={`/profile/${receiverId}`} style={{display:'flex', alignItems:'center', gap: '12px', textDecoration:'none', color: 'inherit'}}>
             <div style={{position:'relative'}}>
                <img src={receiver?.image || "https://via.placeholder.com/40"} className="chat-avatar" alt="avatar" />
                {isReceiverOnline && <div style={{position:'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#10b981', borderRadius: '50%', border: '2px solid #000'}}></div>}
             </div>
             <div style={{display:'flex', flexDirection:'column'}}>
                <span style={{ fontWeight: "700" }}>{receiver?.username || "User"}</span>
                <span className="muted" style={{ fontSize: '0.75rem' }}>{isTyping ? 'Typing...' : (isReceiverOnline ? 'Active now' : 'Offline')}</span>
             </div>
          </Link>
        </div>
        <button onClick={clearActiveChat} className="btn-ghost" title="Clear Chat">🗑️</button>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => ( 
          <div key={i} className={`message-bubble ${m.sender === "me" ? "msg-me" : "msg-them"}`}>
            {m.attachment && (m.attachmentType === 'image' ? <a href={m.attachment} target="_blank"><img src={m.attachment} className="attachment-img"/></a> : <a href={m.attachment}>📄 File</a>)}
            {m.text && <div>{m.text}</div>}
            {m.sender === "me" && <div style={{fontSize:'0.6rem', textAlign:'right', marginTop:'2px', opacity:0.7}}>{m.read ? <span style={{color:'#a5f3fc', fontWeight:'bold'}}>✓✓</span> : <span>✓</span>}</div>}
          </div> 
        ))}
        {isTyping && <div className="typing-indicator"><div className="typing-dots"><span></span><span></span><span></span></div></div>}
        {isUploading && <div className="message-bubble msg-me" style={{opacity: 0.7}}>⏳ Sending...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input-container"><div className="chat-input-wrapper"><button type="button" className="btn-ghost" onClick={() => fileInputRef.current.click()} style={{fontSize:'1.3rem', padding:'0 8px'}}>📎</button><input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} /><input className="chat-input" value={input} onChange={handleInputChange} placeholder="iMessage..." autoFocus /><button type="submit" className="send-btn" disabled={!input.trim() && !isUploading}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></div></form>
    </div>
  );
}