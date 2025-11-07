import AdminPanelService from "../services/adminPanelService.js";
const adminPanelService = new AdminPanelService();

export const getDashboardSummary = async (req, res, next) => {
  try {
    let resp = await adminPanelService.getDashboardSummary();
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const bpmLists = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    let resp = await adminPanelService.getBpmList(page, limit);
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const getBpmProfile = async (req, res, next) => {
  try {
    const { userId } = req.query;
    let resp = await adminPanelService.getBpmProfile(userId);
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const transactionsList = async (req, res, next) => {
  try {
    let resp = await adminPanelService.transactionsList(req.query);
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const TransactionDetailsById = async (req, res, next) => {
  try {
    const { transactionId } = req.query;
    let resp = await adminPanelService.getTransactionDetails(transactionId);
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const updateTransactionNotes = async (req, res, next) => {
  try {
    const { transactionId, notes } = req.body;
    let resp = await adminPanelService.updateTransactionNotes(
      transactionId,
      notes
    );
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const processPayoutByTransactionId = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    let resp = await adminPanelService.processPayoutByTransactionId(
      transactionId
    );
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const searchUser = async (req, res, next) => {
  try {
    const { name } = req.query;
    let resp = await adminPanelService.searchUser(name);
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
export const searchTransaction = async (req, res, next) => {
  try {
    let resp = await adminPanelService.searchTransaction(req.query);
    return res.status(200).json(resp);
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
