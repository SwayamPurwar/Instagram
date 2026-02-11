import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getChatHistoryController,
  getConversationsController,
  deleteChatHistoryController,
  uploadAttachmentController,
  markMessagesReadController,
  sendMessageController
} from "../controllers/chat.controller.js";

const router = express.Router();

// FIX: Limit file size to 5MB
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get("/chat-history/:user1/:user2", authMiddleware, getChatHistoryController);
router.get("/conversations", authMiddleware, getConversationsController);
router.delete("/chat-history/:receiverId", authMiddleware, deleteChatHistoryController);
router.post("/upload", authMiddleware, upload.single("file"), uploadAttachmentController);
router.put("/read", authMiddleware, markMessagesReadController);
router.post("/message", authMiddleware, sendMessageController);

export default router;