import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "pending"],
      default: "accepted",
    },
  },
  { timestamps: true }
);

// Prevent duplicate follows (A user can't follow the same person twice)
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const followModel = mongoose.model("follow", followSchema);
export default followModel;
