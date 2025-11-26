import { uploadFile } from "../services/storage.service.js";
import { generateCaption } from "../services/ai.service.js";
import { v4 as uuidv4 } from "uuid";
import {
  createPost,
  getPosts,
  incrementLikeCount,
  deletePost,
  getPostById,
  updatePost
} from "../dao/post.dao.js";
import { createComment, deleteComment } from "../dao/comment.dao.js";
import { createLike, isLikeExists, deleteLike } from "../dao/like.dao.js";

import userModel from "../models/user.model.js";
import postModel from "../models/post.model.js";
import notificationModel from "../models/notification.model.js";
import commentModel from "../models/comment.model.js"; 
import { sendNotification } from "../sockets/socket.js";

// --- 1. ADD EXPLORE CONTROLLER ---
export async function getExplorePostsController(req, res) {
  try {
    // Fetch top 20 posts with most likes, excluding the current user's posts
    const posts = await postModel.find({ user: { $ne: req.user._id } })
      .sort({ likeCount: -1 }) // Highest likes first
      .limit(20)
      .populate("user", "username image");

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Explore Error:", error);
    res.status(500).json({ message: "Error fetching explore posts" });
  }
}

export async function toggleSavePostController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      await userModel.findByIdAndUpdate(userId, { $pull: { savedPosts: postId } });
      res.status(200).json({ message: "Post unsaved", isSaved: false });
    } else {
      await userModel.findByIdAndUpdate(userId, { $addToSet: { savedPosts: postId } });
      res.status(200).json({ message: "Post saved", isSaved: true });
    }
  } catch (error) {
    console.error("Save Post Error:", error);
    res.status(500).json({ message: "Error toggling save post" });
  }
}

export async function createPostController(req, res) {
  try {
    const { mentions, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const file = await uploadFile(req.file, uuidv4());
    let finalCaption = caption;

    if (!finalCaption || finalCaption.trim() === "") {
      try {
        finalCaption = await generateCaption(req.file);
      } catch (aiError) {
        console.error("AI Caption generation failed:", aiError.message);
        finalCaption = "Check out this amazing photo! 📸";
      }
    }

    const post = await createPost({
      mentions: mentions || "",
      url: file.url,
      caption: finalCaption,
      user: req.user._id,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
}

export async function getPostController(req, res) {
  try {
    const userId = req.query.user || null;
    const currentUserId = req.user._id;

    const posts = await getPosts(req.query.skip, Math.min(req.query.limit, 20), userId);

    const postsWithStatus = await Promise.all(posts.map(async (post) => {
      const like = await isLikeExists({ user: currentUserId, post: post._id });
      return { ...post.toObject(), isLiked: !!like };
    }));

    return res.status(200).json({ message: "Posts fetched successfully", posts: postsWithStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
}

export async function getSinglePostController(req, res) {
  try {
    const { id } = req.params;
    const post = await getPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    const like = await isLikeExists({ user: req.user._id, post: post._id });
    const postWithStatus = { ...post.toObject(), isLiked: !!like };

    res.status(200).json({ post: postWithStatus });
  } catch (error) {
    console.error("Get Single Post Error:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
}

export async function editPostController(req, res) {
  try {
    const { id } = req.params;
    const { caption } = req.body;
    const userId = req.user._id;
    if (!caption) return res.status(400).json({ message: "Caption is required" });
    const updatedPost = await updatePost(id, userId, { caption });
    if (!updatedPost) return res.status(404).json({ message: "Post not found or unauthorized" });
    res.status(200).json({ message: "Post updated", post: updatedPost });
  } catch (error) {
    console.error("Edit Post Error:", error);
    res.status(500).json({ message: "Error editing post" });
  }
}

export async function createCommentController(req, res) {
  try {
    const { post, text } = req.body;
    const user = req.user;
    const comment = await createComment({ user: user._id, post, text });
    try {
      const postObj = await postModel.findById(post).select("user image");
      if (postObj && postObj.user.toString() !== user._id.toString()) {
        await notificationModel.create({ recipient: postObj.user, sender: user._id, type: "comment", post: post, text: text });
        sendNotification(postObj.user, "notification", { message: `${user.username} commented: "${text}"`, type: "comment", sender: { username: user.username, image: user.image }, post: { image: postObj.image } });
      }
    } catch (err) { console.error("Notification Error (Comment):", err); }
    return res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) { console.error(error); res.status(500).json({ message: "Error creating comment" }); }
}

export async function createLikeController(req, res) {
  try {
    const { post } = req.body;
    const user = req.user;
    const isLikeAlreadyExists = await isLikeExists({ user: user._id, post });

    if (isLikeAlreadyExists) {
      await deleteLike({ user: user._id, post });
      await incrementLikeCount(post, -1);
      return res.status(200).json({ message: "Like removed successfully", isLiked: false });
    }

    await incrementLikeCount(post, 1);
    const like = await createLike({ user: user._id, post });

    try {
      const postObj = await postModel.findById(post).select("user image");
      if (postObj && postObj.user.toString() !== user._id.toString()) {
        await notificationModel.create({ recipient: postObj.user, sender: user._id, type: "like", post: post });
        sendNotification(postObj.user, "notification", { message: `${user.username} liked your post`, type: "like", sender: { username: user.username, image: user.image }, post: { image: postObj.image } });
      }
    } catch (err) { console.error("Notification Error (Like):", err); }

    res.status(201).json({ message: "Post liked successfully", like, isLiked: true });
  } catch (error) { console.error(error); res.status(500).json({ message: "Error updating like" }); }
}

export async function deletePostController(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const deletedPost = await deletePost(postId, userId);
    if (!deletedPost) return res.status(404).json({ message: "Post not found or unauthorized" });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) { console.error("Delete Post Error:", error); res.status(500).json({ message: "Error deleting post" }); }
}

export async function deleteCommentController(req, res) {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const comment = await commentModel.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== userId.toString()) return res.status(403).json({ message: "Unauthorized" });
    await deleteComment(commentId);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) { console.error("Delete Comment Error:", error); res.status(500).json({ message: "Error deleting comment" }); }
}

export async function generateCaptionController(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required." });
    const caption = await generateCaption(req.file);
    res.status(200).json({ message: "Caption generated successfully", caption });
  } catch (error) { console.error("Generate Caption Error:", error); res.status(500).json({ message: "Failed to generate caption" }); }
}

export async function getSavedPostsController(req, res) {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await postModel.find({ _id: { $in: user.savedPosts } })
      .sort({ createdAt: -1 })
      .populate("user", "username image")
      .populate("mentions", "username")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" },
      });

    const postsWithStatus = await Promise.all(posts.map(async (post) => {
      const like = await isLikeExists({ user: userId, post: post._id });
      return { ...post.toObject(), isLiked: !!like };
    }));

    res.status(200).json({ posts: postsWithStatus });
  } catch (error) {
    console.error("Get Saved Posts Error:", error);
    res.status(500).json({ message: "Error fetching saved posts" });
  }
}