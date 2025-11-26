import {
  getChatHistory,
  getUserConversations,
  deleteChatHistory,
  createMessage // <--- Ensure this is imported
} from "../dao/message.dao.js";
import { uploadFile } from "../services/storage.service.js";
import { v4 as uuidv4 } from "uuid";
import messageModel from "../models/message.model.js";
import { sendNotification } from "../sockets/socket.js"; // <--- Ensure this is imported

export async function markMessagesReadController(req, res) {
  try {
    const { senderId } = req.body;
    const receiverId = req.user._id;

    await messageModel.updateMany(
      { sender: senderId, receiver: receiverId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
}

export async function getConversationsController(req, res) {
  try {
    const conversations = await getUserConversations(req.user._id);
    const formatted = conversations.map(c => ({
      ...c,
      lastMessage: c.lastMessage || (c.lastAttachment ? (c.lastAttachment === 'image' ? 'Sent an image' : 'Sent a file') : '')
    }));
    res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Conversation Error:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
}

export async function getChatHistoryController(req, res) {
  try {
    const { user1, user2 } = req.params;
    const { limit, skip } = req.query;

    const chatHistory = await getChatHistory(user1, user2, limit, skip);

    res.status(200).json({
      message: "Chat history fetched successfully",
      chatHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
}

export async function deleteChatHistoryController(req, res) {
  try {
    const { receiverId } = req.params;
    const userId = req.user._id;

    await deleteChatHistory(userId, receiverId);

    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({ message: "Error clearing chat history" });
  }
}

export async function uploadAttachmentController(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileData = await uploadFile(req.file, uuidv4());
    const type = req.file.mimetype.startsWith("image/") ? "image" : "file";

    res.status(200).json({ 
      url: fileData.url, 
      type: type 
    });
  } catch (error) {
    console.error("Chat Upload Error:", error);
    res.status(500).json({ message: "File upload failed" });
  }
}

// --- NEW: Send Message Controller (Required for Story Replies) ---
export async function sendMessageController(req, res) {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    if (!message) return res.status(400).json({ message: "Message content required" });

    // 1. Save to DB
    const msg = await createMessage({
      receiver: receiverId,
      sender: senderId,
      text: message
    });

    // 2. Emit Socket Event (so receiver gets it instantly)
    sendNotification(receiverId, "message", {
      text: message,
      sender: senderId,
      receiver: receiverId,
      read: false,
      createdAt: msg.createdAt
    });

    // 3. Emit Notification Toast
    sendNotification(receiverId, "notification", {
      type: "message",
      message: `New message: ${message}`,
      senderId: senderId
    });

    res.status(201).json({ message: "Sent", msg });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
}