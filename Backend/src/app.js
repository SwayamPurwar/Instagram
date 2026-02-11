import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit"; // FIX 1: Import Rate Limiter

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import followRoutes from "./routes/follow.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import storyRoutes from "./routes/story.routes.js";

const app = express();

// FIX 2: Rate Limiter Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: "Too many requests, please try again later." }
});

// Apply rate limiting to all requests
app.use(limiter);

app.set("trust proxy", 1); // Required for rate limiting behind proxies (like Nginx/Heroku)

// FIX 3: Dynamic CORS Origin
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (origin === allowedOrigin) {
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
app.use(express.json({ limit: "10mb" })); // Reduced from 50mb for security (use streams for large files)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Register Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);
app.use("/users", userRoutes);
app.use("/follow", followRoutes);
app.use("/notifications", notificationRoutes);
app.use("/stories", storyRoutes);

export default app;