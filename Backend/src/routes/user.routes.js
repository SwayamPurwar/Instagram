import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// FIX: Import getUserByIdController here
import {
  searchUsersController,
  getUserByIdController,
  updateProfileController, 
  getSuggestedUsersController // 1. Import// <--- MAKE SURE THIS IS IMPORTED
} from "../controllers/user.controller.js";
import multer from "multer"; // Import multer

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // FIX: Limit file size to 5MB
  }
});
const router = express.Router();

// Search route
router.get("/search", authMiddleware, searchUsersController);
router.get("/suggested", authMiddleware, getSuggestedUsersController); //
// Get specific user by ID
router.get("/:id", authMiddleware, getUserByIdController);
router.put(
  "/update",
  authMiddleware,
  upload.single("image"),
  updateProfileController
);

export default router;
