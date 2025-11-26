import storyModel from "../models/story.model.js";
import followModel from "../models/follow.model.js";
import { uploadFile } from "../services/storage.service.js";
import { v4 as uuidv4 } from "uuid";

// 1. Upload a Story
export async function createStoryController(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    // Upload to ImageKit
    const file = await uploadFile(req.file, uuidv4());
    
    const story = await storyModel.create({
      user: req.user._id,
      image: file.url,
    });

    res.status(201).json({ message: "Story added", story });
  } catch (error) {
    console.error("Story Upload Error:", error); // Check your terminal for this log
    res.status(500).json({ message: "Error adding story", error: error.message });
  }
}

// 2. Get Stories Feed
export async function getStoriesController(req, res) {
  try {
    const userId = req.user._id;

    // Find followed users
    const followingDocs = await followModel.find({ follower: userId });
    const followingIds = followingDocs.map(f => f.following);

    // Include self
    const userIds = [...followingIds, userId];

    // Fetch active stories (MongoDB TTL handles expiry)
    const stories = await storyModel.find({ user: { $in: userIds } })
      .populate("user", "username image")
      .sort({ createdAt: -1 });

    res.status(200).json({ stories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stories" });
  }
}