import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createStoryController, getStoriesController } from "../controllers/story.controller.js";
import multer from "multer";

// FIX: Add file size limit (5MB)
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createStoryController);
router.get("/", authMiddleware, getStoriesController);

export default router;