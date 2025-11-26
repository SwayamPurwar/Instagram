import mongoose from "mongoose";
import config from "../config/config.js";

function connectDB() {
  mongoose
    .connect(config.MONGODB_URL)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
}

export default connectDB;
