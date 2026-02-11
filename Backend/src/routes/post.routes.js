// Backend/src/routes/post.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPostController,
  getPostController,
  createCommentController,
  createLikeController,
  deletePostController,
  toggleSavePostController,
  getSinglePostController,
  editPostController,
  deleteCommentController,
  generateCaptionController,
  getSavedPostsController,
  getExplorePostsController // <--- 1. IMPORT
} from "../controllers/post.controller.js";
import {
  createCommentValidator,
  getPostsValidator,
  createLikeValidator,
} from "../middlewares/validator.middleware.js";
import multer from "multer";


const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // FIX: Limit file size to 5MB
  }
});
const router = express.Router();
/* GET Routes */
router.get("/", getPostsValidator, authMiddleware, getPostController);
router.get("/saved", authMiddleware, getSavedPostsController);
router.get("/explore", authMiddleware, getExplorePostsController); // <--- 2. ADD ROUTE (Must be before /:id) 



/* POST Routes */
router.post("/", authMiddleware, upload.single("image"), createPostController);
router.post("/ai-caption", authMiddleware, upload.single("image"), generateCaptionController);
router.post("/comment", createCommentValidator, authMiddleware, createCommentController);
router.post("/like", createLikeValidator, authMiddleware, createLikeController);
router.post("/save/:postId", authMiddleware, toggleSavePostController);





/* PUT/DELETE Routes */
router.put("/:id", authMiddleware, editPostController);
router.delete("/comment/:commentId", authMiddleware, deleteCommentController);
router.delete("/:id", authMiddleware, deletePostController);

router.get("/:id", authMiddleware, getSinglePostController);

export default router;