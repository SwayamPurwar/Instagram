import userModel from "../models/user.model.js";
import followModel from "../models/follow.model.js";
import { uploadFile } from "../services/storage.service.js";
import { v4 as uuidv4 } from "uuid";

// 1. Update Profile (Bio & Image)
export async function updateProfileController(req, res) {
  try {
    const userId = req.user._id;
    const { bio } = req.body;

    let updateData = {};
    
    // Only update bio if it was provided
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // If an image file is uploaded, upload it to ImageKit
    if (req.file) {
      console.log("Uploading new avatar...");
      const fileData = await uploadFile(req.file, uuidv4());
      updateData.image = fileData.url;
    }

    // Update user in DB
    const user = await userModel.findByIdAndUpdate(
      userId, 
      { $set: updateData }, 
      { new: true } // Return the updated document
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
}

// 2. Search Users
export async function searchUsersController(req, res) {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ users: [] });

    // Regex for partial match (case-insensitive)
    const users = await userModel
      .find({ 
        $or: [
            { username: { $regex: query, $options: "i" } },
            { bio: { $regex: query, $options: "i" } }
        ]
      })
      .select("-password -email")
      .limit(10);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Error searching users" });
  }
}

// 3. Get User By ID
export async function getUserByIdController(req, res) {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
}

// 4. Get Suggestions
export async function getSuggestedUsersController(req, res) {
  try {
    const userId = req.user._id;
    
    // Find who I am already following
    const followingDocs = await followModel.find({ follower: userId });
    const followingIds = followingDocs.map(f => f.following);

    // Find users NOT me and NOT following
    const suggestions = await userModel.find({
      _id: { $nin: [...followingIds, userId] }
    })
    .limit(5)
    .select("username image bio");

    res.status(200).json({ users: suggestions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggestions" });
  }
}