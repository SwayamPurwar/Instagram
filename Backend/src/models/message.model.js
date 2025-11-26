import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
    },
    attachment: { type: String, default: null },
    attachmentType: { type: String, default: "text" },
    
    // --- NEW FIELD ---
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;