import notificationModel from "../models/notification.model.js";

export async function getNotifications(req, res) {
  try {
    const notifications = await notificationModel
      .find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username image")
      .populate("post", "image"); // Show post image for likes/comments
    
    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

export async function markRead(req, res) {
  try {
    await notificationModel.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notifications" });
  }
}