import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    caption: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    likeCount: { type: Number, default: 0 },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Important: Include virtuals when converting to JSON
    toObject: { virtuals: true },
  }
);

// Virtual Field: Find comments where comment.post == post._id
postSchema.virtual("comments", {
  ref: "comments",
  localField: "_id",
  foreignField: "post",
});

const Post = mongoose.model("posts", postSchema);

export default Post;
