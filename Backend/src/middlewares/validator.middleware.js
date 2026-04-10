import { query, body, validationResult } from "express-validator";
import mongoose from "mongoose";

export const registerValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 30 })
    .withMessage("Password must be between 6 and 20 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const getPostsValidator = [
  query("limit")
    .isInt()
    .withMessage("Limit must be an integer")
    .custom((value) => value >= 1 && value <= 20)
    .withMessage("Limit must be between 1 and 20"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const createCommentValidator = [
  body("post")
    .notEmpty()
    .withMessage("Post ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Post ID");
      }
      return true;
    }),
  body("text")
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment text must be between 1 and 500 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const createLikeValidator = [
  body("post")
    .notEmpty()
    .withMessage("Post ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Post ID");
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
