import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  toggleFollowController,
  getFollowStatsController,
} from "../controllers/follow.controller.js";

const router = express.Router();

router.post("/toggle", authMiddleware, toggleFollowController);
router.get("/stats/:id", authMiddleware, getFollowStatsController);

export default router;
