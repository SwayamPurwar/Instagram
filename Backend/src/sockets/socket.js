import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { createMessage } from "../dao/message.dao.js"; 
import config from "../config/config.js"; 

let io;
// Map to track online users: UserId -> Set(SocketIds)
const userSockets = new Map(); 

export function sendNotification(receiverId, eventType, data) {
  if (userSockets.has(String(receiverId)) && io) {
    const sockets = userSockets.get(String(receiverId));
    for (const socketId of sockets) {
      io.to(socketId).emit(eventType, data);
    }
  }
}

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Middleware: Authentication
  io.use((socket, next) => {
    const cookies = socket.request.headers.cookie;
    const { token } = cookie.parse(cookies || "");

    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET); 
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // 1. Add User to Map
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // 2. Broadcast Updated Online List to ALL clients
    io.emit("getOnlineUsers", Array.from(userSockets.keys()));

    console.log(`User connected: ${userId}`);

    socket.on("disconnect", () => {
      // 3. Remove User on Disconnect
      if (userSockets.has(userId)) {
        const userSocketSet = userSockets.get(userId);
        userSocketSet.delete(socket.id);
        
        // If no more tabs open, remove user entirely
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
        }
      }
      
      // 4. Broadcast Updated List
      io.emit("getOnlineUsers", Array.from(userSockets.keys()));
      console.log(`User disconnected: ${userId}`);
    });

    // --- TYPING EVENTS ---
    socket.on("typing", ({ receiver }) => {
        sendNotification(receiver, "typing", { sender: socket.user._id });
    });

    socket.on("stopTyping", ({ receiver }) => {
        sendNotification(receiver, "stopTyping", { sender: socket.user._id });
    });

    // --- READ RECEIPTS ---
    socket.on("markRead", ({ senderId }) => {
        sendNotification(senderId, "messageRead", { reader: socket.user._id });
    });

    // --- MESSAGE HANDLING ---
    socket.on("message", async (msg) => {
      const { receiver, message, attachment, attachmentType } = msg;
      const senderId = socket.user._id.toString();

      // 1. Emit to Receiver
      sendNotification(receiver, "message", {
        text: message,
        attachment,       
        attachmentType,   
        sender: senderId,
        receiver: receiver,
      });

      // 2. Notification Text Logic
      let notifText = message;
      if (!message && attachment) {
        notifText = attachmentType === 'image' ? 'Sent an image' : 'Sent a file';
      }
      
      sendNotification(receiver, "notification", {
        type: "message",
        message: `New message: ${notifText}`,
        senderId: senderId
      });

      // 3. Save to DB
      await createMessage({
        receiver,
        sender: senderId,
        text: message,
        attachment,
        attachmentType
      });
    });
  });
}

export default setupSocket;