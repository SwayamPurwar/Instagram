import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: { type: String, enum: ["like", "comment", "follow"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "posts" }, // Optional (for likes/comments)
    text: { type: String }, // Optional (for comments)
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("notification", notificationSchema);
export default notificationModel;
