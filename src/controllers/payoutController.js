import payoutService from "../services/payoutService.js";

export const processWeeklyPayouts = async (req, res) => {
  try {
    // This route should be protected with additional security measures
    // since it handles financial operations
    const apiKey = req.headers['x-api-key'];

    // In a real application, validate the API key against a secure stored value
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access to payout processing"
      });
    }

    const results = await payoutService.processWeeklyPayouts();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error in processWeeklyPayouts:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

export const processManualPayout = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const results = await payoutService.processManualPayout(userId);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error in processManualPayout:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

export const getPayoutHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const history = await payoutService.getPayoutHistory(userId);
    res.status(200).json(history);
  } catch (err) {
    console.error("Error in getPayoutHistory:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

export const checkPayoutStatus = async (req, res) => {
  try {
    const { payoutId } = req.params;

    if (!payoutId) {
      return res.status(400).json({
        success: false,
        message: "Payout ID is required"
      });
    }

    const status = await payoutService.checkPayoutStatus(payoutId);
    res.status(200).json(status);
  } catch (err) {
    console.error("Error in checkPayoutStatus:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

export const getPayoutStats = async (req, res) => {
  try {
    // Implement stats functionality as needed
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      data: {
        totalPayouts: 0,
        totalAmountPaid: 0,
        pendingPayouts: 0
      }
    });
  } catch (err) {
    console.error("Error in getPayoutStats:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};