import ChatSession from "../models/chatSession.js";
import Message from "../models/message.js";
import {
  generateChatResponse,
  calculateCost,
} from "../services/openaiService.js";

class ChatService {
  // Create a new chat session
  async createChatSession(user, body) {
    try {
      const { title } = body;

      const session = await ChatSession.create({
        user_id: user.id,
        title: title || "New Chat",
      });

      return {
        success: true,
        status: 201,
        message: "Chat session created successfully",
        data: session,
      };
    } catch (error) {
      console.error("Error creating chat session:", error);
      return {
        success: false,
        status: 500,
        message: "Failed to create chat session",
      };
    }
  }

  // Fetch user's sessions
  async getChatSessions(user) {
    try {
      const sessions = await ChatSession.findAll({
        where: { user_id: user.id, is_active: true },
        order: [["updatedAt", "DESC"]],
      });

      return {
        success: true,
        status: 200,
        message: "Chat sessions fetched successfully",
        count: sessions.length,
        data: sessions,
      };
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return {
        success: false,
        status: 500,
        message: "Failed to fetch chat sessions",
      };
    }
  }

  // Get messages for a session
  async getMessages(user, sessionId) {
    try {
      const session = await ChatSession.findOne({
        where: { id: sessionId, user_id: user.id },
      });

      if (!session) {
        return { success: false, status: 404, message: "Session not found" };
      }

      const messages = await Message.findAll({
        where: { session_id: sessionId },
        order: [["createdAt", "ASC"]],
      });

      return {
        success: true,
        status: 200,
        message: "Messages fetched successfully",
        data: messages,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return {
        success: false,
        status: 500,
        message: "Failed to fetch messages",
      };
    }
  }

  // Send message & generate AI response
  async sendMessage(user, body) {
    try {
      const { session_id, content } = body;

      if (!session_id || !content)
        return {
          success: false,
          status: 400,
          message: "Session ID and content are required",
        };

      if (content.length > 4000)
        return {
          success: false,
          status: 400,
          message: "Message too long (max 4000 characters)",
        };

      const session = await ChatSession.findOne({
        where: { id: session_id, user_id: user.id },
      });

      if (!session)
        return { success: false, status: 404, message: "Session not found" };

      // Get previous 10 messages for context
      const previousMessages = await Message.findAll({
        where: { session_id },
        order: [["createdAt", "DESC"]],
        limit: 10,
        attributes: ["role", "content"],
      });

      const conversationHistory = [
        ...previousMessages.reverse().map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content },
      ];

      // Generate AI reply
      const { response, tokensUsed, isUnknownQuestion } =
        await generateChatResponse(conversationHistory);

      // Save both user and AI messages
      const userMessage = await Message.create({
        session_id,
        role: "user",
        content,
        is_unknown_question: isUnknownQuestion,
      });

      const assistantMessage = await Message.create({
        session_id,
        role: "assistant",
        content: response,
        token_count: tokensUsed,
        answered_from_faq: !isUnknownQuestion,
      });

      // Update session timestamp
      session.updatedAt = new Date();
      await session.save();

      const cost = calculateCost(tokensUsed);

      return {
        success: true,
        status: 201,
        message: "Message processed successfully",
        data: {
          userMessage,
          assistantMessage,
          tokensUsed,
          cost: cost.toFixed(6),
        },
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, status: 500, message: "Failed to send message" };
    }
  }

  // Soft delete chat session
  async deleteChatSession(user, sessionId) {
    try {
      const session = await ChatSession.findOne({
        where: { id: sessionId, user_id: user.id },
      });

      if (!session)
        return { success: false, status: 404, message: "Session not found" };

      session.is_active = false;
      await session.save();

      return {
        success: true,
        status: 200,
        message: "Chat session deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting session:", error);
      return {
        success: false,
        status: 500,
        message: "Failed to delete chat session",
      };
    }
  }
}

export default ChatService;
