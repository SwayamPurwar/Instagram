import postModel from "../models/post.model.js";
import userModel from "../models/user.model.js";

export async function createPost(data) {
  const { mentions, url, caption, user } = data;
  let mentionIds = [];

  if (mentions && typeof mentions === "string" && mentions.trim().length > 0) {
    const usernames = mentions
      .split(",")
      .map((m) => m.trim().replace(/^@/, ""))
      .filter((m) => m.length > 0);

    if (usernames.length > 0) {
      const usersFound = await userModel.find({ username: { $in: usernames } });
      mentionIds = usersFound.map((u) => u._id);
    }
  }

  return await postModel.create({
    image: url,
    caption,
    user,
    mentions: mentionIds,
  });
}

export async function incrementLikeCount(postId, incrementBy) {
  return await postModel.findByIdAndUpdate(postId, {
    $inc: { likeCount: incrementBy },
  });
}

export async function getPosts(skip = 0, limit = 10, userId = null) {
  const query = userId ? { user: userId } : {};

  const posts = await postModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user")
    .populate("mentions", "username")
    .populate({
      path: "comments",
      populate: { path: "user", select: "username" },
    });

  return posts;
}

export async function deletePost(postId, userId) {
  return await postModel.findOneAndDelete({ _id: postId, user: userId });
}

// --- NEW FUNCTIONS FOR SINGLE POST & EDIT ---
export async function getPostById(postId) {
  return await postModel.findById(postId)
    .populate("user")
    .populate("mentions", "username")
    .populate({
      path: "comments",
      populate: { path: "user", select: "username image" },
    });
}

export async function updatePost(postId, userId, updateData) {
  return await postModel.findOneAndUpdate(
    { _id: postId, user: userId },
    { $set: updateData },
    { new: true }
  );
}