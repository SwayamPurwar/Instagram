import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    // This field tells MongoDB to delete the document 24 hours after creation
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours in seconds
    },
  }
);

const storyModel = mongoose.model("story", storySchema);
export default storyModel;