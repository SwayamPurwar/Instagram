import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  searchUsersController,
  getUserByIdController,
  updateProfileController, 
  getSuggestedUsersController
} from "../controllers/user.controller.js";
import multer from "multer"; 

// Configure Multer (Memory Storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

router.get("/search", authMiddleware, searchUsersController);
router.get("/suggested", authMiddleware, getSuggestedUsersController);
router.get("/:id", authMiddleware, getUserByIdController);

// Update Route (accepts 'image' field)
router.put(
  "/update",
  authMiddleware,
  upload.single("image"), // <--- Must match frontend formData.append('image', ...)
  updateProfileController
);

export default router;