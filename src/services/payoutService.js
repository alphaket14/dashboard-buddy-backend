import Stripe from "stripe";
import { Op } from "sequelize";
import sequelize from "../config/database.js"; // Import the sequelize instance
import stripeAccount from "../models/stripeAccount.js";
import User from "../models/user.js";
import Payout from "../models/payout.js";
import EarningHistory from "../models/earningHistory.js";
import { sendWeeklyPayoutEmail } from "../utils/emailUtils.js";

export function getPayoutWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Calculate start date (Monday)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Adjust to Monday

  // Calculate end date (Sunday, which is today)
  const endDate = new Date(today);

  // Format dates (e.g., "YYYY-MM-DD")
  const formatDate = (date) => date.toISOString().split("T")[0];

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

// Get Stripe key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey);

class PayoutService {
  /**
   * Process weekly payouts for all users with positive balances
   * @returns {Object} Summary of payout process
   */
  async processWeeklyPayouts() {
    const transaction = await sequelize.transaction();

    try {
      // 1. Get all users with positive balances who are eligible for payout
      const eligibleUsers = await User.findAll({
        include: [
          {
            model: stripeAccount,
            where: {
              status: "active", // Only include users with active Stripe accounts
            },
            as:"stripeAccount",
            required: true,
          },
        ],
        where: {
          walletBalance: {
            [Op.gt]: 0, // Balance greater than 0
          },
        },
        transaction,
      });

      if (!eligibleUsers || eligibleUsers.length === 0) {
        await transaction.commit();
        return {
          success: true,
          message: "No eligible users found for payouts this week",
          processedAt: new Date().toISOString(),
          payoutsProcessed: 0,
        };
      }

      const payoutResults = [];
      let successCount = 0;
      let failureCount = 0;

      // 2. Process payout for each eligible user
      for (const user of eligibleUsers) {
        try {
          // Get Stripe account
          const stripeAccount = user.stripeAccount;

          if (!stripeAccount || !stripeAccount.accountId) {
            payoutResults.push({
              userId: user.id,
              success: false,
              amount: user.walletBalance,
              error: "No Stripe account found for user",
            });
            failureCount++;
            continue;
          }

          const walletBalance = parseFloat(user.walletBalance);
          const amountInCents = Math.floor(walletBalance * 100); // Convert to cents for Stripe

          // Create a transfer using Stripe
          const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: "usd", // This should be configurable based on user's country
            destination: stripeAccount.accountId,
            description: `Weekly payout for ReferMe earnings - ${new Date().toISOString().split("T")[0]}`,
          });

          if (transfer && transfer.id) {
            // Record payout in our database
            const payout = await Payout.create(
              {
                userId: user.id,
                stripePayoutId: transfer.id,
                amount: walletBalance,
                currency: "usd",
                status: transfer.status,
                stripeAccountId: stripeAccount.accountId,
                description: transfer.description,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              { transaction },
            );

            // Update user wallet to zero out the balance
            user.walletBalance = 0;
            await user.save({ transaction });

            // Record transaction in earnings history
            await EarningHistory.create(
              {
                userId: user.id,
                amount: walletBalance,
                type: "withdrawal",
                reference: payout.id,
                description: `Weekly payout - ${transfer.id}`,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              { transaction },
            );

            payoutResults.push({
              userId: user.id,
              success: true,
              amount: walletBalance,
              payoutId: transfer.id,
              status: transfer.status,
            });

            const { startDate, endDate } = getPayoutWeekDates();
            const emailData = {
              email: user.email,
              bpmName: user.firstName + " " + user.lastName,
              startDate,
              endDate,
              totalAmountEarned: user.totalEarnings,
              completedReferrals: user.totalBusinessesReferred,
              totalPaid: walletBalance,
            };

            sendWeeklyPayoutEmail(emailData);
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing payout for user ${user.id}:`, error);

          payoutResults.push({
            userId: user.id,
            success: false,
            amount: user.walletBalance,
            error: error.message || "Unknown error during payout processing",
          });

          failureCount++;
        }
      }

      // Commit transaction if everything succeeded
      await transaction.commit();

      return {
        success: true,
        message: "Weekly payouts processed",
        processedAt: new Date().toISOString(),
        payoutsProcessed: successCount,
        payoutsFailed: failureCount,
        results: payoutResults,
      };
    } catch (error) {
      // Rollback transaction if there was an error
      await transaction.rollback();
      console.error("Error processing weekly payouts:", error);

      return {
        success: false,
        message: "Failed to process weekly payouts",
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Process a manual payout for a specific user
   * @param {string} userId The user ID to process payout for
   * @returns {Object} Result of the payout attempt
   */
  async processManualPayout(userId) {
    const transaction = await sequelize.transaction();

    try {
      // Find the user
      const user = await User.findByPk(userId, {
        include: [
          {
            model: stripeAccount,
            required: true,
          },
        ],
        transaction,
      });

      if (!user) {
        await transaction.rollback();
        return {
          success: false,
          message: "User not found",
        };
      }

      // Check if user has a Stripe account
      if (!user.StripeAccount || !user.StripeAccount.accountId) {
        await transaction.rollback();
        return {
          success: false,
          message: "No Stripe account found for user",
        };
      }

      // Check if user has a positive balance
      const walletBalance = parseFloat(user.walletBalance);
      if (walletBalance <= 0) {
        await transaction.rollback();
        return {
          success: false,
          message: "User has no balance to pay out",
        };
      }

      const amountInCents = Math.floor(walletBalance * 100); // Convert to cents for Stripe
      const stripeAccount = user.StripeAccount;

      // Create a transfer using Stripe
      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: "usd", // Should be configurable
        destination: stripeAccount.accountId,
        description: `Manual payout for ReferMe earnings - ${new Date().toISOString().split("T")[0]}`,
      });

      if (transfer && transfer.id) {
        // Record payout in our database
        const payout = await Payout.create(
          {
            userId: user.id,
            stripePayoutId: transfer.id,
            amount: walletBalance,
            currency: "usd",
            status: transfer.status,
            stripeAccountId: stripeAccount.accountId,
            description: transfer.description,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction },
        );

        // Update user wallet to zero out the balance
        user.walletBalance = 0;
        await user.save({ transaction });

        // Record transaction in earnings history
        await EarningHistory.create(
          {
            userId: user.id,
            amount: walletBalance,
            type: "withdrawal",
            reference: payout.id,
            description: `Manual payout - ${transfer.id}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction },
        );

        // Commit transaction
        await transaction.commit();

        return {
          success: true,
          message: "Manual payout processed successfully",
          amount: walletBalance,
          payoutId: transfer.id,
          status: transfer.status,
        };
      } else {
        await transaction.rollback();

        return {
          success: false,
          message: "Failed to create payout with Stripe",
        };
      }
    } catch (error) {
      // Rollback transaction if there was an error
      await transaction.rollback();
      console.error("Error processing manual payout:", error);

      return {
        success: false,
        message: "Failed to process manual payout",
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Get payout history for a specific user
   * @param {string} userId The user ID to get payout history for
   * @returns {Object} Payout history for the user
   */
  async getPayoutHistory(userId) {
    try {
      const payouts = await Payout.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: payouts,
      };
    } catch (error) {
      console.error("Error fetching payout history:", error);
      return {
        success: false,
        message: "Failed to fetch payout history",
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Check the status of a specific payout
   * @param {string} payoutId The payout ID to check
   * @returns {Object} Current status of the payout
   */
  async checkPayoutStatus(payoutId) {
    try {
      const payout = await Payout.findByPk(payoutId);

      if (!payout) {
        return {
          success: false,
          message: "Payout not found",
        };
      }

      // Verify current status in Stripe
      const stripeTransfer = await stripe.transfers.retrieve(
        payout.stripePayoutId,
      );

      // Update status if it has changed
      if (stripeTransfer.status !== payout.status) {
        payout.status = stripeTransfer.status;
        await payout.save();
      }

      return {
        success: true,
        data: payout,
      };
    } catch (error) {
      console.error("Error checking payout status:", error);
      return {
        success: false,
        message: "Failed to check payout status",
        error: error.message || "Unknown error",
      };
    }
  }
}

export default new PayoutService();
