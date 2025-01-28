import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { logger } from "../utils/logger";
import { User } from "../models/User";
import { Message } from "../models/Message";
import dotenv from "dotenv";

dotenv.config();

// Custom interfaces
interface AuthenticatedSocket extends Socket {
  userId: string;
  username: string;
  isAuthenticated: boolean;
}

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

// Active connections store
const activeConnections = new Map<string, AuthenticatedSocket>();

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token || typeof token !== "string") {
        throw new Error("Authentication error: Token required");
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }

      // Verify JWT token and find user
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as CustomJwtPayload;

      if (!decoded.id) {
        throw new Error("Invalid token format");
      }

      const user = await User.findById(decoded.id)
        .select("_id username isOnline")
        .lean();

      if (!user) {
        logger.warn("Socket auth failed: User not found", {
          userId: decoded.id,
        });
        throw new Error("Authentication error: User not found");
      }

      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.isAuthenticated = true;

      next();
    } catch (error) {
      logger.error("Socket authentication error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        token:
          token !== undefined && typeof token === "string"
            ? "Present"
            : "Missing",
        socketId: socket.id,
      });

      if (error instanceof jwt.JsonWebTokenError) {
        return next(new Error("Invalid authentication token"));
      }

      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error("Authentication token has expired"));
      }

      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", async (socket: AuthenticatedSocket) => {
    try {
      logger.info("User connected to socket:", {
        userId: socket.userId,
        socketId: socket.id,
      });

      // Add to active connections
      activeConnections.set(socket.userId, socket);

      // Join user's personal room for private messages
      await socket.join(socket.userId);

      // Update user's online status
      await User.findByIdAndUpdate(
        socket.userId,
        {
          isOnline: true,
          lastSeen: new Date(),
          socketId: socket.id,
        },
        { new: true }
      );

      // Broadcast user's online status
      socket.broadcast.emit("userStatusChanged", {
        userId: socket.userId,
        isOnline: true,
        lastSeen: new Date(),
      });

      // Handle private messages
      socket.on("sendMessage", async (data) => {
        try {
          const message = await Message.create({
            sender: socket.userId,
            receiver: data.receiverId,
            content: data.content,
            messageType: data.messageType || "text",
            status: "sent",
          });

          await message.populate([
            { path: "sender", select: "username avatar" },
            { path: "receiver", select: "username avatar" },
          ]);

          // Emit to sender with message ID
          socket.emit("messageSent", {
            messageId: message._id,
            tempId: data.tempId,
          });

          // Emit to receiver
          socket.to(data.receiverId).emit("messageReceived", message);

          // Update message status
          message.status = "delivered";
          await message.save();
        } catch (error) {
          logger.error("Error in sendMessage socket handler:", error);
          socket.emit("error", "Failed to send message");
        }
      });

      // Handle typing indicators with debounce
      let typingTimeout: NodeJS.Timeout;

      socket.on("typing", (data: { receiverId: string }) => {
        clearTimeout(typingTimeout);

        socket.to(data.receiverId).emit("userTyping", {
          userId: socket.userId,
          username: socket.username,
        });

        // Auto stop typing after 3 seconds
        typingTimeout = setTimeout(() => {
          socket.to(data.receiverId).emit("userStoppedTyping", {
            userId: socket.userId,
          });
        }, 3000);
      });

      socket.on("stopTyping", (data: { receiverId: string }) => {
        clearTimeout(typingTimeout);
        socket.to(data.receiverId).emit("userStoppedTyping", {
          userId: socket.userId,
        });
      });

      // Handle disconnection
      socket.on("disconnect", async (reason) => {
        try {
          logger.info("Socket disconnected:", {
            userId: socket.userId,
            reason,
          });

          // If client should attempt to reconnect
          if (reason === "transport close" || reason === "ping timeout") {
            socket.connect();
          }

          clearTimeout(typingTimeout);
          // Remove from active connections
          activeConnections.delete(socket.userId);

          // Update user's offline status
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Broadcast offline status
          socket.broadcast.emit("userStatusChanged", {
            userId: socket.userId,
            isOnline: false,
            lastSeen: new Date(),
          });

          logger.info("User disconnected:", {
            userId: socket.userId,
            socketId: socket.id,
          });
        } catch (error) {
          logger.error("Error in disconnect handler:", error);
        }
      });

      socket.on("messageSent", (messageId) => {
        socket.emit("messageDelivered", { messageId });
      });

      // Add this near the top of your socket connection handler
      socket.on("error", (error) => {
        logger.error("Socket error for user:", {
          userId: socket.userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Notify client of error
        socket.emit("error", "An error occurred with your connection");
      });
    } catch (error) {
      logger.error("Error in socket connection handler:", error);
      socket.disconnect(true);
    }
  });

  // Error handler
  io.on("error", (error) => {
    logger.error("Socket.IO server error:", error);
  });

  return io;
};

// Utility functions
export const emitToUser = (
  io: Server,
  userId: string,
  event: string,
  data: any
): void => {
  const userSocket = activeConnections.get(userId);
  if (userSocket) {
    userSocket.emit(event, data);
  }
};

export const broadcastToAll = (io: Server, event: string, data: any): void => {
  io.emit(event, data);
};

// Event interfaces
export interface ServerToClientEvents {
  messageReceived: (message: {
    _id: string;
    content: string;
    sender: {
      _id: string;
      username: string;
      avatar?: string;
    };
    receiver: {
      _id: string;
      username: string;
      avatar?: string;
    };
    status: "sent" | "delivered" | "read";
    createdAt: string;
  }) => void;
  messageSent: (data: { success: boolean; messageId: string }) => void;
  messageDelivered: (data: { messageId: string }) => void;
  userTyping: (data: { userId: string; username: string }) => void;
  userStoppedTyping: (data: { userId: string }) => void;
  userStatusChanged: (data: {
    userId: string;
    isOnline: boolean;
    lastSeen: Date;
  }) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: {
    receiverId: string;
    content: string;
    messageType?: "text" | "image" | "file";
  }) => void;
  messageSent: (messageId: string) => void;
  typing: (data: { receiverId: string }) => void;
  stopTyping: (data: { receiverId: string }) => void;
}
