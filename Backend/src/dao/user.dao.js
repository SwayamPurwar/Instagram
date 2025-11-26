import userModel from "../models/user.model.js";

/**
 * Function to create a new user in the database.
 */
export async function createUser(data) {
  return await userModel.create(data);
}

export async function findUser(query) {
  return await userModel.find(query);
}

export async function findOneUser(query) {
  return await userModel.findOne(query);
}

export async function updateUser(userId, updateData) {
  // Find user by ID and update. { new: true } returns the updated document.
  return await userModel
    .findByIdAndUpdate(userId, updateData, { new: true })
    .select("-password");
}
