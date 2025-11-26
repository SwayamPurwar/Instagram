import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import followRoutes from "./routes/follow.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import storyRoutes from "./routes/story.routes.js"; // 1. Import

const app = express();
app.set("trust proxy", 1);
const allowedOrigin = "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        console.error(`CORS Blocked: Origin ${origin} is not allowed.`);
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Register Routesa
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);
app.use("/users", userRoutes);
app.use("/follow", followRoutes);
app.use("/notifications", notificationRoutes);
app.use("/stories", storyRoutes); // 2. Register

export default app;