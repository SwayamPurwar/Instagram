import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Matches userModel registration
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "posts", // Matches postModel registration
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

const commentModel = mongoose.model("comments", commentSchema);
export default commentModel;