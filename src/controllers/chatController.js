import ChatService from "../services/chatService.js";

const chatService = new ChatService();

// ✅ Create chat session
export const createChatSession = async (req, res, next) => {
  try {
    const result = await chatService.createChatSession(req.user, req.body);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error creating chat session:", error);
    next(error);
  }
};

// ✅ Get all sessions
export const getChatSessions = async (req, res, next) => {
  try {
    const result = await chatService.getChatSessions(req.user);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    next(error);
  }
};

// ✅ Get messages by session
export const getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await chatService.getMessages(req.user, sessionId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    next(error);
  }
};

// ✅ Send message and get AI response
export const sendMessage = async (req, res, next) => {
  try {
    const result = await chatService.sendMessage(req.user, req.body);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error sending message:", error);
    next(error);
  }
};

// ✅ Delete chat session
export const deleteChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await chatService.deleteChatSession(req.user, sessionId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error deleting session:", error);
    next(error);
  }
};
