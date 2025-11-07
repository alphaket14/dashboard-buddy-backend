import express from "express";
import {
  getDashboardSummary,
  bpmLists,
  getBpmProfile,
  transactionsList,
  TransactionDetailsById,
  updateTransactionNotes,
  processPayoutByTransactionId,
  searchUser,
  searchTransaction,
} from "../controllers/adminPanelController.js";

import {
  getAllChats,
  getBPMChats,
  getSessionMessages,
  getUnknownQuestions,
  getChatStats,
} from "../controllers/adminChatController.js";

const router = express.Router();

router.get("/getDashboardSummary", getDashboardSummary);

router.get("/bpmLists", bpmLists);
router.get("/getBpmProfile", getBpmProfile);
router.get("/transactionsList", transactionsList);
router.get("/TransactionDetailsById", TransactionDetailsById);
router.post("/updateTransactionNotes", updateTransactionNotes);
router.post("/processPayoutByTransactionId", processPayoutByTransactionId);
router.get("/search", searchUser);
router.get("/searchTransaction", searchTransaction);

// Chat viewing routes
router.get("/chats", getAllChats);
router.get("/chats/:userId", getBPMChats); // Changed from :bpmId to :userId
router.get("/sessions/:sessionId/messages", getSessionMessages);

// Analytics routes
router.get("/unknown-questions", getUnknownQuestions);
router.get("/stats", getChatStats);

export default router;
