import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { createMessage } from "../dao/message.dao.js";
import config from "../config/config.js";
// FIX 1: Import Redis Adapter dependencies
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

let io;
// We keep a simple Set for online status tracking (green dot).
// For routing, we now use Socket.io Rooms.
const onlineUsers = new Set();

export function sendNotification(receiverId, eventType, data) {
  if (io) {
    // FIX 2: Send to the room named after the user's ID.
    // This works across multiple servers if Redis is set up.
    io.to(String(receiverId)).emit(eventType, data);
  }
}

async function setupSocket(server) {
  // FIX 3: Dynamic CORS from environment variable
  const origin = process.env.CORS_ORIGIN || "http://localhost:5173";

  io = new Server(server, {
    cors: {
      origin: origin,
      credentials: true,
    },
  });

  // FIX 4: Setup Redis Adapter for Scalability
  // (Only activates if REDIS_URL is provided in .env)
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);
      
      io.adapter(createAdapter(pubClient, subClient));
      console.log("✅ Redis Adapter connected");
    } catch (err) {
      console.error("❌ Redis Connection Error:", err.message);
    }
  }

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
    // Safely attempt to get the user ID from either _id or id
    const userId = socket.user?._id?.toString() || socket.user?.id?.toString();

    // If for some reason the ID is missing from the token payload, log and disconnect
    if (!userId) {
      console.error("❌ Disconnecting socket: User ID not found in token.", socket.user);
      return socket.disconnect();
    }

    // FIX 5: Scalable Routing -> User joins a room with their own ID
    socket.join(userId);

    // Track Online Status (Simplified for single-instance, expandable for Redis)
    onlineUsers.add(userId);
    io.emit("getOnlineUsers", Array.from(onlineUsers));

    console.log(`User connected: ${userId}`);

    socket.on("disconnect", () => {
      // Check if user has other tabs open (other sockets in the same room)
      // io.sockets.adapter.rooms is a Map where key=roomName, value=Set(socketIds)
      const room = io.sockets.adapter.rooms.get(userId);
      
      if (!room || room.size === 0) {
        onlineUsers.delete(userId);
        io.emit("getOnlineUsers", Array.from(onlineUsers));
      }
      console.log(`User disconnected: ${userId}`);
    });

    // --- TYPING EVENTS ---
    socket.on("typing", ({ receiver }) => {
      // Broadcast to the receiver's room
      io.to(receiver).emit("typing", { sender: userId });
    });

    socket.on("stopTyping", ({ receiver }) => {
      io.to(receiver).emit("stopTyping", { sender: userId });
    });

    // --- READ RECEIPTS ---
    socket.on("markRead", ({ senderId }) => {
      io.to(senderId).emit("messageRead", { reader: userId });
    });

    // --- MESSAGE HANDLING ---
    socket.on("message", async (msg) => {
      const { receiver, message, attachment, attachmentType } = msg;

      // 1. Emit to Receiver (Using Room)
      io.to(receiver).emit("message", {
        text: message,
        attachment,
        attachmentType,
        sender: userId,
        receiver: receiver,
      });

      // 2. Notification Text Logic
      let notifText = message;
      if (!message && attachment) {
        notifText = attachmentType === 'image' ? 'Sent an image' : 'Sent a file';
      }

      // 3. Send Notification (Using Room)
      io.to(receiver).emit("notification", {
        type: "message",
        message: `New message: ${notifText}`,
        senderId: userId
      });

      // 4. Save to DB
      try {
        await createMessage({
          receiver,
          sender: userId,
          text: message,
          attachment,
          attachmentType
        });
      } catch (error) {
        console.error("Message Save Error:", error);
      }
    });
  });
}

export default setupSocket;