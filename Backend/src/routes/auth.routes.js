import express from "express";
// FIX: Added 'logoutController' to the import list below
import {
  registerController,
  loginController,
  logoutController,
} from "../controllers/auth.controller.js";
import { registerValidator } from "../middlewares/validator.middleware.js";

const router = express.Router();

router.post("/register", registerValidator, registerController);
router.post("/login", loginController);

// Logout Route
router.post("/logout", logoutController);

export default router;
