import likeModel from "../models/like.model.js";

export async function createLike({ user, post }) {
  const like = await likeModel.create({ user, post });
  return like;
}

export async function isLikeExists({ user, post }) {
  const like = await likeModel.findOne({
    user,
    post,
  });

  return like;
}

export async function deleteLike({ user, post }) {
  await likeModel.findOneAndDelete({ user, post });
}
