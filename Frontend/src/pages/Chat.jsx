import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext.jsx";
import { useSocket } from "../context/SocketContext.jsx"; // 1. Import Global Socket
import config from "../config";

export default function Chat() {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // 2. Use Global Socket instead of local state
  const socket = useSocket(); 
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileList, setIsMobileList] = useState(!receiverId);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const API_URL = config.API_URL;

  // Initialize User
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { navigate("/login"); return; }
    setCurrentUser(JSON.parse(storedUser));

    // Fetch conversations list
    axios.get(`${API_URL}/chat/conversations`, { withCredentials: true })
      .then(res => setConversations(res.data.conversations || []))
      .catch(console.error);
  }, []);

  // Load Active Chat
  useEffect(() => {
    if (receiverId) {
      setIsMobileList(false);
      // Fetch Receiver Info
      axios.get(`${API_URL}/users/${receiverId}`, { withCredentials: true })
        .then(res => setReceiver(res.data.user));
      
      // Fetch History
      if (currentUser) {
        axios.get(`${API_URL}/chat/chat-history/${currentUser.id}/${receiverId}`, { withCredentials: true })
          .then(res => {
             const formatted = res.data.chatHistory.map(msg => ({
               text: msg.text,
               image: msg.attachment, // Fix: Backend returns 'attachment', mapped to image
               sender: msg.sender === currentUser.id ? "me" : "them",
               createdAt: msg.createdAt
             }));
             setMessages(formatted.reverse());
             scrollToBottom();
          });
      }
    } else {
      setIsMobileList(true);
      setReceiver(null);
    }
  }, [receiverId, currentUser]);

  // 3. Socket Events (Using Global Socket)
  useEffect(() => {
    if (!socket) return;

    // Listen for online users
    socket.on("getOnlineUsers", (users) => setOnlineUsers(users));
    
    // Listen for incoming messages
    const handleMessage = (msg) => {
      // Only append if the message belongs to the CURRENT open chat
      if (msg.sender === receiverId || msg.receiver === receiverId) {
        setMessages(prev => [...prev, { 
          text: msg.text, 
          image: msg.attachment, // Handle attachment
          sender: msg.sender === currentUser?.id ? "me" : "them" 
        }]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ sender }) => { 
      if (sender === receiverId) setIsTyping(true); 
    };
    
    const handleStopTyping = ({ sender }) => { 
      if (sender === receiverId) setIsTyping(false); 
    };

    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("message", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, receiverId, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (socket) {
        const msgData = { receiver: receiverId, message: input };
        socket.emit("message", msgData);
        
        // Optimistic Update
        setMessages(prev => [...prev, { text: input, sender: "me" }]);
        setInput("");
        scrollToBottom();
    } else {
        addToast("Connection lost. Trying to reconnect...", "error");
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    addToast("Sending image...", "info");

    const formData = new FormData();
    formData.append("file", file); // Backend expects 'file'
    formData.append("receiverId", receiverId);
    formData.append("message", ""); 

    try {
      const res = await axios.post(`${API_URL}/chat/upload`, formData, { 
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Manually emit the image message via socket so it shows up instantly
      if (socket && res.data.url) {
         socket.emit("message", {
            receiver: receiverId,
            message: "",
            attachment: res.data.url,
            attachmentType: "image"
         });
         
         setMessages(prev => [...prev, { 
            image: res.data.url, 
            sender: "me" 
         }]);
         scrollToBottom();
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to send image", "error");
    } finally {
      setUploading(false);
      if(imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (socket) {
        socket.emit("typing", { receiver: receiverId });
        setTimeout(() => socket.emit("stopTyping", { receiver: receiverId }), 2000);
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1100px' }}>
      <div className="chat-container">
        
        {/* SIDEBAR LIST */}
        <div className={`chat-sidebar ${isMobileList ? 'active' : ''}`} style={{ display: isMobileList ? 'flex' : undefined }}>
           <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
             <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Messages</h2>
           </div>
           <div style={{ overflowY: 'auto', flex: 1 }}>
             {conversations.map(c => (
               <Link 
                 key={c._id} 
                 to={`/chat/${c.userDetails._id}`} 
                 className={`chat-list-item ${receiverId === c.userDetails._id ? 'active' : ''}`}
               >
                 <img src={c.userDetails.image || "https://via.placeholder.com/40"} className="chat-avatar" alt="User" />
                 <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontWeight: 600 }}>{c.userDetails.username}</div>
                   <div className="muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                     {c.lastMessage || (c.lastAttachment === 'image' ? 'Sent an image' : '')}
                   </div>
                 </div>
               </Link>
             ))}
             {conversations.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>No conversations yet.</div>
             )}
           </div>
        </div>

        {/* CHAT AREA */}
        {receiverId ? (
          <div className="chat-main" style={{ display: isMobileList ? 'none' : 'flex' }}>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => navigate('/chat')} className="btn-ghost" style={{ display: 'md-none', marginRight: '-8px' }}>←</button>
                <img src={receiver?.image || "https://via.placeholder.com/40"} className="chat-avatar" alt="User" />
                <div>
                   <div style={{ fontWeight: 700 }}>{receiver?.username}</div>
                   <div style={{ fontSize: '0.75rem', color: onlineUsers.includes(receiverId) ? '#10b981' : 'var(--text-secondary)' }}>
                     {onlineUsers.includes(receiverId) ? 'Active now' : 'Offline'}
                   </div>
                </div>
              </div>
              <Link to={`/profile/${receiverId}`} className="btn-ghost">View Profile</Link>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`message-bubble ${m.sender === 'me' ? 'msg-me' : 'msg-them'}`} style={{ background: m.image ? 'transparent' : undefined, padding: m.image ? 0 : undefined, border: m.image ? 'none' : undefined, boxShadow: m.image ? 'none' : undefined }}>
                  {m.image ? (
                    <img 
                      src={m.image} 
                      alt="attachment" 
                      className="attachment-img"
                    />
                  ) : (
                    m.text
                  )}
                </div>
              ))}
              {isTyping && <div className="typing-indicator"><div className="typing-dots"><span></span><span></span><span></span></div></div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-area">
              <div className="chat-input-wrapper">
                <button 
                  type="button" 
                  className="btn-ghost" 
                  onClick={() => imageInputRef.current.click()} 
                  style={{ padding: '8px', color: 'var(--primary)' }}
                  disabled={uploading}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </button>
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />

                <input 
                  className="chat-input" 
                  placeholder="Message..."
                  value={input}
                  onChange={handleTyping}
                />
                <button type="submit" className="send-btn" disabled={!input.trim()}>
                   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="chat-main" style={{ display: isMobileList ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ textAlign: 'center', opacity: 0.5 }}>
               <div style={{ fontSize: '4rem' }}>💬</div>
               <p>Select a conversation to start chatting</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}