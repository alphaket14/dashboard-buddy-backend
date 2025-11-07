import { performQuery } from "../config/db.js";
import writerPool from "../config/db.js";

// Extends the existing StripeDAL with additional methods for payouts
class StripeDALExtension {
  /**
   * Get all users eligible for payouts (those with connected accounts and positive balances)
   * @returns {Array} List of eligible users
   */
  async getEligibleUsersForPayout() {
    const query = `
      SELECT 
        uw.userId, 
        uw.balance, 
        ad.stripeAccountId
      FROM 
        UserWallet uw
      JOIN 
        AccountDetails ad ON uw.userId = ad.userId
      WHERE 
        uw.balance > 0
        AND ad.stripeAccountId IS NOT NULL
      ORDER BY 
        uw.userId
    `;

    const results = await performQuery({ sql: query });
    return results;
  }

  /**
   * Record a new payout in the database
   * @param {Object} payoutData Data for the payout
   * @returns {Number} ID of the created payout record
   */
  async recordPayout(payoutData) {
    const {
      userId,
      stripePayoutId,
      amount,
      currency,
      status,
      stripeAccountId,
      description,
      transaction
    } = payoutData;

    const query = `
      INSERT INTO Payouts (
        userId, 
        stripePayoutId, 
        amount, 
        currency, 
        status, 
        stripeAccountId, 
        description, 
        createdAt, 
        updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const values = [
      userId,
      stripePayoutId,
      amount,
      currency,
      status,
      stripeAccountId,
      description
    ];

    const result = await performQuery({
      sql: query,
      values,
      transaction
    });

    return result.insertId;
  }

  /**
   * Get payout history for a specific user
   * @param {String} userId User ID to get history for
   * @returns {Array} List of payouts for the user
   */
  async getPayoutHistoryByUserId(userId) {
    const query = `
      SELECT 
        id,
        userId,
        stripePayoutId,
        amount,
        currency,
        status,
        description,
        createdAt,
        updatedAt
      FROM 
        Payouts
      WHERE 
        userId = ?
      ORDER BY 
        createdAt DESC
    `;

    const results = await performQuery({
      sql: query,
      values: [userId]
    });

    return results;
  }

  /**
   * Get details of a specific payout
   * @param {Number} payoutId The payout ID to get
   * @returns {Object} Payout details
   */
  async getPayoutById(payoutId) {
    const query = `
      SELECT 
        id,
        userId,
        stripePayoutId,
        amount,
        currency,
        status,
        description,
        createdAt,
        updatedAt
      FROM 
        Payouts
      WHERE 
        id = ?
    `;

    const results = await performQuery({
      sql: query,
      values: [payoutId]
    });

    return results[0];
  }

  /**
   * Update the status of a payout
   * @param {Number} payoutId The payout ID to update
   * @param {String} status The new status
   * @returns {Boolean} Success of the update
   */
  async updatePayoutStatus(payoutId, status) {
    const query = `
      UPDATE Payouts
      SET 
        status = ?,
        updatedAt = NOW()
      WHERE 
        id = ?
    `;

    const result = await performQuery({
      sql: query,
      values: [status, payoutId]
    });

    return result.affectedRows > 0;
  }

  /**
   * Check if a user already has a pending payout
   * @param {String} userId User ID to check
   * @returns {Boolean} Whether the user has a pending payout
   */
  async hasUserPendingPayout(userId) {
    const query = `
      SELECT 
        COUNT(*) as pendingCount
      FROM 
        Payouts
      WHERE 
        userId = ?
        AND status IN ('pending', 'in_transit')
    `;

    const result = await performQuery({
      sql: query,
      values: [userId]
    });

    return result[0].pendingCount > 0;
  }

  /**
   * Get all payouts with a specific status
   * @param {String} status Status to filter by
   * @returns {Array} List of payouts with the specified status
   */
  async getPayoutsByStatus(status) {
    const query = `
      SELECT 
        id,
        userId,
        stripePayoutId,
        amount,
        currency,
        status,
        description,
        createdAt,
        updatedAt
      FROM 
        Payouts
      WHERE 
        status = ?
      ORDER BY 
        createdAt DESC
    `;

    const results = await performQuery({
      sql: query,
      values: [status]
    });

    return results;
  }

  /**
   * Get all payouts within a date range
   * @param {Date} startDate Start date for range
   * @param {Date} endDate End date for range
   * @returns {Array} List of payouts in the date range
   */
  async getPayoutsInDateRange(startDate, endDate) {
    const query = `
      SELECT 
        id,
        userId,
        stripePayoutId,
        amount,
        currency,
        status,
        description,
        createdAt,
        updatedAt
      FROM 
        Payouts
      WHERE 
        createdAt >= ?
        AND createdAt <= ?
      ORDER BY 
        createdAt DESC
    `;

    const results = await performQuery({
      sql: query,
      values: [startDate, endDate]
    });

    return results;
  }

  /**
   * Get total payout amount by status
   * @param {String} status Status to filter by
   * @returns {Number} Total amount of payouts with the status
   */
  async getTotalPayoutAmountByStatus(status) {
    const query = `
      SELECT 
        SUM(amount) as totalAmount
      FROM 
        Payouts
      WHERE 
        status = ?
    `;

    const result = await performQuery({
      sql: query,
      values: [status]
    });

    return result[0].totalAmount || 0;
  }
}

export default StripeDALExtension;