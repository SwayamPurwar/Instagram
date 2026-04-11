import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { findOneUser } from "../dao/user.dao.js";

export async function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, please login first.",
    });
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await findOneUser({ _id: decoded._id });
    
    // ADD THIS CHECK: If the token is valid but user is deleted/not found
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists, please login again.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token, please login again.",
    });
  }
}