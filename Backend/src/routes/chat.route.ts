/**
 * @file chat.routes.ts
 * @description Chat routes configuration
 *
 * This file defines the routes for chat functionality including
 * sending messages, retrieving conversations, and managing message status.
 */

import express, { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import {
  sendMessage,
  getConversation,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
} from "../controllers/chat.controller";

const router: Router = express.Router();

/**
 * Message Routes
 * Base path: /api/chat
 */

/**
 * @route   POST /api/chat/messages
 * @desc    Send a new message
 * @access  Private
 * @body    {
 *            receiverId: string,
 *            content: string,
 *            messageType?: 'text' | 'image' | 'file'
 *          }
 */
router.post("/messages", auth, sendMessage);

/**
 * @route   GET /api/chat/conversations/:userId
 * @desc    Get conversation with a specific user
 * @access  Private
 * @param   userId - ID of the user to get conversation with
 * @query   page - Page number for pagination (default: 1)
 * @query   limit - Number of messages per page (default: 50)
 */
router.get("/conversations/:userId", auth, getConversation);

/**
 * @route   PUT /api/chat/messages/:messageId/read
 * @desc    Mark a message as read
 * @access  Private
 * @param   messageId - ID of the message to mark as read
 */
router.put("/messages/:messageId/read", auth, markMessageAsRead);

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private
 * @param   messageId - ID of the message to delete
 */
router.delete("/messages/:messageId", auth, deleteMessage);

/**
 * @route   GET /api/chat/messages/unread/count
 * @desc    Get count of unread messages
 * @access  Private
 */
router.get("/messages/unread/count", auth, getUnreadCount);

/**
 * Success Response Format:
 * {
 *   "success": true,
 *   "data": {
 *     // Response data
 *   }
 * }
 *
 * Error Response Format:
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */

export default router;

/**
 * Example Usage:
 *
 * 1. Send Message:
 * POST /api/chat/messages
 * {
 *   "receiverId": "user_id",
 *   "content": "Hello!",
 *   "messageType": "text"
 * }
 *
 * 2. Get Conversation:
 * GET /api/chat/conversations/user_id?page=1&limit=50
 *
 * 3. Mark as Read:
 * PUT /api/chat/messages/message_id/read
 *
 * 4. Delete Message:
 * DELETE /api/chat/messages/message_id
 *
 * 5. Get Unread Count:
 * GET /api/chat/messages/unread/count
 */
