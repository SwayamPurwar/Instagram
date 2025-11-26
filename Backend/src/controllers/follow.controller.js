import followModel from "../models/follow.model.js";
import { sendNotification } from "../sockets/socket.js";
import notificationModel from "../models/notification.model.js";

export async function toggleFollowController(req, res) {
  try {
    const { userId } = req.body; // The user to follow/unfollow
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existingFollow = await followModel.findOne({
      follower: currentUserId,
      following: userId,
    });

    if (existingFollow) {
      // --- UNFOLLOW LOGIC ---
      await followModel.findByIdAndDelete(existingFollow._id);

      // 1. Cleanup: Remove the previous "Follow" notification from the DB
      // so the user doesn't see "X started following you" after X has unfollowed.
      await notificationModel.findOneAndDelete({
        recipient: userId,
        sender: currentUserId,
        type: "follow",
      });

      // 2. SEND REAL-TIME UNFOLLOW NOTIFICATION
      // This triggers the alert on the client side immediately.
      sendNotification(userId, "notification", {
        message: `${req.user.username} unfollowed you`,
        type: "unfollow",
        sender: {
          username: req.user.username,
          image: req.user.image,
        },
      });

      return res
        .status(200)
        .json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // --- FOLLOW LOGIC ---
      await followModel.create({
        follower: currentUserId,
        following: userId,
      });

      // 1. Save "Follow" notification to DB
      await notificationModel.create({
        recipient: userId,
        sender: currentUserId,
        type: "follow",
      });

      // 2. Send Real-time Notification
      sendNotification(userId, "notification", {
        message: `${req.user.username} started following you`,
        type: "follow",
        sender: {
          username: req.user.username,
          image: req.user.image,
        },
      });

      return res
        .status(200)
        .json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error toggling follow" });
  }
}

export async function getFollowStatsController(req, res) {
  try {
    const { id } = req.params;

    const followersCount = await followModel.countDocuments({ following: id });
    const followingCount = await followModel.countDocuments({ follower: id });

    // Check if the requesting user is already following this profile
    let isFollowing = false;
    if (req.user) {
      const check = await followModel.exists({
        follower: req.user._id,
        following: id,
      });
      isFollowing = !!check;
    }

    res.status(200).json({ followersCount, followingCount, Vk: isFollowing });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
}