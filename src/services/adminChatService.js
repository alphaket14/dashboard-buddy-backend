import ChatSession from "../models/chatSession.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import { Op } from "sequelize";
import sequelize from "../config/database.js";

class AdminChatService {
  // Get all BPM chat sessions
  async getAllChats({ page = 1, limit = 100, user_id, startDate, endDate }) {
    const where = {};

    // Filter by user_id (BPM identifier)
    if (user_id) where.user_id = user_id;

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;

    const { count, rows: sessions } = await ChatSession.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    return {
      success: true,
      message: "Chat sessions fetched successfully",
      count: sessions.length,
      totalCount: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: sessions,
    };
  }

  // Get specific BPM chat history (by user_id)
  async getBPMChats(userId) {
    const sessions = await ChatSession.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      message: "BPM chat history fetched successfully",
      user_id: userId,
      sessionCount: sessions.length,
      data: sessions,
    };
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId) {
    const session = await ChatSession.findByPk(sessionId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!session) {
      return { success: false, message: "Session not found" };
    }

    const messages = await Message.findAll({
      where: { session_id: sessionId },
      order: [["createdAt", "ASC"]],
    });

    return {
      success: true,
      message: "Session messages fetched successfully",
      session,
      messageCount: messages.length,
      data: messages,
    };
  }

  // Get unknown questions
  async getUnknownQuestions() {
    const unknownMessages = await Message.findAll({
      where: {
        is_unknown_question: true,
        role: "user",
      },
      include: [
        {
          model: ChatSession,
          as: "session",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    return {
      success: true,
      message: "Unknown questions fetched successfully",
      count: unknownMessages.length,
      data: unknownMessages,
    };
  }

  // Get chat statistics
  async getChatStats() {
    const totalSessions = await ChatSession.count();
    const totalMessages = await Message.count();
    const unknownQuestions = await Message.count({
      where: { is_unknown_question: true },
    });

    const tokenStats = await Message.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("token_count")), "totalTokens"],
      ],
    });

    const totalTokens = parseInt(tokenStats?.dataValues?.totalTokens) || 0;
    const totalCost = (totalTokens * 0.375) / 1_000_000;

    // Get active BPMs (users with chat sessions)
    const activeBPMs = await ChatSession.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("user_id")), "user_id"],
      ],
    });

    return {
      success: true,
      message: "Chat statistics fetched successfully",
      data: {
        totalSessions,
        totalMessages,
        unknownQuestions,
        totalTokens,
        estimatedCost: `$${totalCost.toFixed(4)}`,
        activeBPMs: activeBPMs.length,
      },
    };
  }
}

export default AdminChatService;
