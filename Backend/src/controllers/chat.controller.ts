/**
 * @file chat.controller.ts
 * @description Chat controller handling message operations
 *
 * This controller implements the core chat functionality including
 * sending messages, retrieving conversations, and handling message status.
 */

import { Request, Response } from "express";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { logger } from "../utils/logger";

/**
 * Send Message Controller
 * @route POST /api/chat/messages
 */

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { receiverId, content, messageType = "text" } = req.body;
    const senderId = req.user._id;

    // Validate receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({
        success: false,
        message: "Failed to send message: Invalid recipient",
      });
      return;
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
    });

    // Populate sender and receiver details
    await message.populate([
      { path: "sender", select: "username avatar" },
      { path: "receiver", select: "username avatar" },
    ]);

    // Emit socket event if available
    if (req.io) {
      req.io.to(receiverId.toString()).emit("messageReceived", message);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message: Server error",
    });
  }
};

/**
 * Get Conversation Controller
 * @route GET /api/chat/conversations/:userId
 */
export const getConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    logger.info("Fetching conversation:", {
      currentUserId,
      otherUserId: userId,
    });

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate([
        { path: "sender", select: "username avatar" },
        { path: "receiver", select: "username avatar" },
      ]);

    logger.info(`Found ${messages.length} messages`);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error in getConversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
    });
  }
};

/**
 * Mark Message as Read Controller
 * @route PUT /api/chat/messages/:messageId/read
 */
export const markMessageAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      receiver: userId,
      status: { $ne: "read" },
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: "Message not found or already read",
      });
      return;
    }

    await message.markAsRead();

    // Emit socket event if available
    if (req.io) {
      req.io.to(message.sender.toString()).emit("messageRead", messageId);
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error("Error in markMessageAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read: Server error",
    });
  }
};

/**
 * Delete Message Controller
 * @route DELETE /api/chat/messages/:messageId
 */
export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      $or: [{ sender: userId }, { receiver: userId }],
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: "Message not found",
      });
      return;
    }

    await message.softDelete(userId);

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteMessage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message: Server error",
    });
  }
};

/**
 * Get Unread Messages Count Controller
 * @route GET /api/chat/messages/unread/count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const count = await Message.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    logger.error("Error in getUnreadCount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count: Server error",
    });
  }
};
