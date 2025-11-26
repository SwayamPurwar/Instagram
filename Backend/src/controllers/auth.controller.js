import bcrypt from "bcryptjs";
import { createUser,  findOneUser } from "../dao/user.dao.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function registerController(req, res) {
  const { username, email, password } = req.body;
  const isUserExist = await findOneUser({
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  });

  if (isUserExist) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    username,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, config.JWT_SECRET);

  res.cookie("token", token);

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      image: user.image,
    },
  });
}

export async function loginController(req, res) {
  const { email, password, username } = req.body;

  const user = await findOneUser({ $or: [{ email }, { username }] });

  if (!user) {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }

  const token = jwt.sign({ _id: user._id }, config.JWT_SECRET);

  res.cookie("token", token);

  return res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      image: user.image,
    },
  });
}
export async function logoutController(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
}
