import userModel from "../models/user.model.js";
import followModel from "../models/follow.model.js"; // Import this for suggestions
import { updateUser } from "../dao/user.dao.js";
import { uploadFile } from "../services/storage.service.js";
import { v4 as uuidv4 } from "uuid";

export async function updateProfileController(req, res) {
  try {
    const userId = req.user._id;
    const { bio } = req.body;

    let updateData = {};
    if (bio !== undefined) updateData.bio = bio;

    // If an image file is uploaded, upload it to ImageKit
    if (req.file) {
      const fileData = await uploadFile(req.file, uuidv4());
      updateData.image = fileData.url;
    }

    const user = await updateUser(userId, updateData);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
}

export async function searchUsersController(req, res) {
  try {
    const { query } = req.query;

    // If no query, return empty list
    if (!query) {
      return res.status(200).json({ users: [] });
    }

    // Search for users (case-insensitive) and exclude password
    // FIX: Use $text search instead of $regex for performance
    const users = await userModel
      .find({ $text: { $search: query } }) 
      .select("-password")
      .limit(10);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Error searching users" });
  }
}

export async function getUserByIdController(req, res) {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
}

// --- NEW: Get Suggested Users ---
export async function getSuggestedUsersController(req, res) {
  try {
    const userId = req.user._id;

    // 1. Find who I am already following
    const followingDocs = await followModel.find({ follower: userId });
    const followingIds = followingDocs.map(f => f.following);

    // 2. Find users who are NOT me and NOT in my following list
    const suggestions = await userModel.find({
      _id: { $nin: [...followingIds, userId] }
    })
    .limit(5) // Just 5 suggestions
    .select("username image email"); // Only need basic info

    res.status(200).json({ users: suggestions });
  } catch (error) {
    console.error("Suggestions Error:", error);
    res.status(500).json({ message: "Error fetching suggestions" });
  }
}