import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createStoryController, getStoriesController } from "../controllers/story.controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createStoryController);
router.get("/", authMiddleware, getStoriesController);

export default router;