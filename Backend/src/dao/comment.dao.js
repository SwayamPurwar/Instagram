import commentModel from "../models/comment.model.js";

export async function createComment(data) {
  const { user, post, text } = data;

  return await commentModel.create({
    user,
    post,
    text,
  });
}

// ADD THIS FUNCTION
export async function deleteComment(commentId) {
  return await commentModel.findByIdAndDelete(commentId);
}