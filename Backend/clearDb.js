import mongoose from "mongoose";
import config from "./src/config/config.js";

async function clearDatabase() {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("Connected to MongoDB...");

    // This drops the current database defined in the connection string
    await mongoose.connection.db.dropDatabase();
    
    console.log("✅ Database cleared successfully for this project.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error clearing database:", err);
    process.exit(1);
  }
}

clearDatabase();