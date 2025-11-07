import express from "express";
import multer from "multer";
import {
  createChatSession,
  getChatSessions,
  getMessages,
  sendMessage,
  deleteChatSession,
} from "../controllers/chatController.js";

import { protect } from "../middlewares/authMiddleware.js"; // match client's convention

const router = express.Router();
const upload = multer(); // If file upload is ever needed

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat session management and AI conversation
 */

/**
 * @swagger
 * /api/chat/sessions:
 *   post:
 *     summary: Create a new chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Chat"
 *     responses:
 *       201:
 *         description: Chat session created successfully
 *       500:
 *         description: Failed to create chat session
 */
router.post("/sessions", protect, createChatSession);

/**
 * @swagger
 * /api/chat/sessions:
 *   get:
 *     summary: Get all chat sessions for logged-in user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat sessions
 *       500:
 *         description: Failed to fetch chat sessions
 */
router.get("/sessions", protect, getChatSessions);

/**
 * @swagger
 * /api/chat/sessions/{sessionId}/messages:
 *   get:
 *     summary: Get all messages for a specific session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: List of messages for the session
 *       404:
 *         description: Session not found
 */
router.get("/sessions/:sessionId/messages", protect, getMessages);

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: Send a message and receive AI response
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *                 example: "1"
 *               content:
 *                 type: string
 *                 example: "Tell me about the latest product updates"
 *     responses:
 *       201:
 *         description: Message sent and AI response received
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Session not found
 *       500:
 *         description: Failed to send message
 */
router.post("/messages", protect, sendMessage);

/**
 * @swagger
 * /api/chat/sessions/{sessionId}:
 *   delete:
 *     summary: Soft delete a chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat session deleted successfully
 *       404:
 *         description: Session not found
 */
router.delete("/sessions/:sessionId", protect, deleteChatSession);

export default router;
