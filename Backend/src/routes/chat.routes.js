import express from "express";
import multer from "multer";
import {
  getChatHistoryController,
  getConversationsController,
  deleteChatHistoryController,
  uploadAttachmentController,
  markMessagesReadController,
  sendMessageController // <--- Import the new controller
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/chat-history/:user1/:user2", authMiddleware, getChatHistoryController);
router.get("/conversations", authMiddleware, getConversationsController);
router.delete("/chat-history/:receiverId", authMiddleware, deleteChatHistoryController);
router.post("/upload", authMiddleware, upload.single("file"), uploadAttachmentController);
router.put("/read", authMiddleware, markMessagesReadController);

// --- NEW ROUTE FOR STORY REPLIES ---
router.post("/message", authMiddleware, sendMessageController);

export default router;