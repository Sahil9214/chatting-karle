import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config as dotenvConfig } from "dotenv";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";
import { initializeSocket } from "./config/socket";
import authRoutes from "./routes/auth.route";
import chatRoutes from "./routes/chat.route";
import userRoutes from "./routes/user.route";
// Load environment variables
dotenvConfig();

const app = express();
const server = createServer(app);
const io = initializeSocket(server);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      io?: ReturnType<typeof initializeSocket>;
    }
  }
}

// Middleware setup
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/users", userRoutes);
// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
    });
  }
);

// Server startup
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
