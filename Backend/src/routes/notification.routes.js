import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// Removed the incorrect 'Sx' from the import below
import { getNotifications, markRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read", authMiddleware, markRead);

export default router;