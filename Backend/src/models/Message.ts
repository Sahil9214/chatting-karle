/**
 * @file Message.ts
 * @description Message model for the chat application
 *
 * This file defines the MongoDB Message schema and model with TypeScript integration.
 * It includes relationships with the User model and message status tracking.
 */

import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

/**
 * Message Interface Definition
 * @extends Document to inherit MongoDB document functionality
 */
export interface IMessage extends Document {
  sender: IUser["_id"];
  receiver: IUser["_id"];
  content: string;
  messageType: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  readAt?: Date;
  attachments?: string[];
  deletedFor: IUser["_id"][];
  markAsRead: () => Promise<void>;
  softDelete: (userId: string) => Promise<void>;
}

/**
 * Static methods interface
 */
interface IMessageModel extends mongoose.Model<IMessage> {
  getConversation(
    user1Id: string,
    user2Id: string,
    limit?: number,
    page?: number
  ): Promise<IMessage[]>;
  getUnreadCount(userId: string): Promise<number>;
}

/**
 * MongoDB Schema Definition for Message
 *
 * Features:
 * 1. References to User model for sender and receiver
 * 2. Message status tracking
 * 3. Support for different message types
 * 4. Soft delete functionality
 */
const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true, // Optimize queries by sender
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
      index: true, // Optimize queries by receiver
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    readAt: {
      type: Date,
      default: null,
    },

    attachments: [
      {
        type: String,
        // URLs to attached files
        // Production: Use cloud storage URLs (S3, Cloudinary, etc.)
      },
    ],

    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // Soft delete: Message still exists but isn't visible to these users
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Indexes for query optimization
 * Compound index for conversation queries
 */
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ status: 1 }); // For querying unread messages

/**
 * Query Middleware
 * Automatically filter out deleted messages for the current user
 */
messageSchema.pre(/^find/, function (next) {
  if (this.options && this.options.bypassDelete) {
    return next();
  }

  // Exclude messages that are deleted for the current user
  if (this.options?.currentUser) {
    this.find({ deletedFor: { $ne: this.options.currentUser } });
  }
  next();
});

/**
 * Instance Methods
 */

/**
 * Mark message as read
 * Updates status and sets readAt timestamp
 */
messageSchema.methods.markAsRead = async function (): Promise<void> {
  this.status = "read";
  this.readAt = new Date();
  await this.save();
};

/**
 * Soft delete message for a user
 * Adds user to deletedFor array
 */
messageSchema.methods.softDelete = async function (
  userId: string
): Promise<void> {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
    await this.save();
  }
};

/**
 * Static Methods
 */

/**
 * Get conversation between two users
 * Returns paginated messages sorted by createdAt
 */
messageSchema.statics.getConversation = async function (
  user1Id: string,
  user2Id: string,
  limit = 50,
  page = 1
): Promise<IMessage[]> {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("sender", "username avatar")
    .populate("receiver", "username avatar");
};

/**
 * Get unread message count for a user
 */
messageSchema.statics.getUnreadCount = async function (
  userId: string
): Promise<number> {
  return this.countDocuments({
    receiver: userId,
    status: { $ne: "read" },
  });
};

/**
 * Create and export the Message model
 */
export const Message = mongoose.model<IMessage, IMessageModel>(
  "Message",
  messageSchema
);

/**
 * Usage Examples:
 *
 * 1. Create new message:
 * const message = await Message.create({
 *   sender: senderId,
 *   receiver: receiverId,
 *   content: 'Hello!',
 *   messageType: 'text'
 * });
 *
 * 2. Get conversation:
 * const messages = await Message.getConversation(user1Id, user2Id);
 *
 * 3. Mark as read:
 * await message.markAsRead();
 *
 * 4. Soft delete:
 * await message.softDelete(userId);
 *
 * 5. Get unread count:
 * const count = await Message.getUnreadCount(userId);
 */

/**
 * Production Considerations:
 *
 * 1. Message Storage:
 * - Implement message archiving for old messages
 * - Consider sharding for large message volumes
 * - Implement message cleanup/retention policies
 *
 * 2. Performance:
 * - Add caching for active conversations
 * - Implement read receipts efficiently
 * - Optimize indexes based on query patterns
 *
 * 3. Security:
 * - Add message encryption
 * - Implement message expiration
 * - Add abuse prevention measures
 */
