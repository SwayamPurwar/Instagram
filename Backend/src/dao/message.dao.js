import messageModel from "../models/message.model.js";
import mongoose from "mongoose";

// Updated to accept attachment data
export async function createMessage({ receiver, sender, text, attachment, attachmentType }) {
  const message = await messageModel.create({
    receiver,
    sender,
    text,
    attachment,
    attachmentType,
  });
  return message;
}

export async function getChatHistory(user1, user2, limit = 20, skip = 0) {
  const chatHistory = await messageModel
    .find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return chatHistory;
}

export async function deleteChatHistory(user1, user2) {
  await messageModel.deleteMany({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  });
}

export async function getUserConversations(userId) {
  const objectId = new mongoose.Types.ObjectId(String(userId));

  return await messageModel.aggregate([
    {
      $match: {
        $or: [{ sender: objectId }, { receiver: objectId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$sender", objectId] }, "$receiver", "$sender"],
        },
        lastMessage: { $first: "$text" },
        // If text is empty (file only), show "Sent an attachment"
        lastAttachment: { $first: "$attachmentType" }, 
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        userDetails: { $ne: null },
      },
    },
    {
      $project: {
        "userDetails.password": 0,
        "userDetails.email": 0,
        "userDetails.__v": 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
}