import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { 
  createStoryController, 
  getStoriesController,
  deleteStoryController 
} from "../controllers/story.controller.js";
import multer from "multer";

// Limit file size to 5MB
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createStoryController);
router.get("/", authMiddleware, getStoriesController);
router.delete("/:id", authMiddleware, deleteStoryController);

export default router;