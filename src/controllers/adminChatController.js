import AdminChatService from "../services/adminChatService.js";
const adminChatService = new AdminChatService();

// Get all BPM chat sessions (Admin View)
export const getAllChats = async (req, res, next) => {
  try {
    const { page, limit, user_id, startDate, endDate } = req.query;
    const resp = await adminChatService.getAllChats({
      page,
      limit,
      user_id, // Changed from bpm_id to user_id
      startDate,
      endDate,
    });
    return res.status(200).json(resp);
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};

// Get specific BPM's chat history
export const getBPMChats = async (req, res, next) => {
  try {
    const { userId } = req.params; // Changed from bpmId to userId
    const resp = await adminChatService.getBPMChats(userId);
    return res.status(200).json(resp);
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};

// Get messages for a specific session (Admin View)
export const getSessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const resp = await adminChatService.getSessionMessages(sessionId);
    return res.status(200).json(resp);
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};

// Get unknown questions log
export const getUnknownQuestions = async (req, res, next) => {
  try {
    const resp = await adminChatService.getUnknownQuestions();
    return res.status(200).json(resp);
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};

// Get chat statistics
export const getChatStats = async (req, res, next) => {
  try {
    const resp = await adminChatService.getChatStats();
    return res.status(200).json(resp);
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};
