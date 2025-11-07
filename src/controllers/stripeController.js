import Stripe from "stripe";
import sequelize from "../config/database.js";
import User from "../models/user.js";
import Withdrawal from "../models/withdrawal.js";
import EarningHistory from "../models/earningHistory.js";
import StripeAccount from "../models/stripeAccount.js"; // Ensure this is imported

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processWithdrawal = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId, amount } = req.body;

    // Find the user
    const user = await User.findByPk(userId, {
      include: [
        {
          model: StripeAccount,
          required: true,
        },
      ],
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a Stripe account
    if (!user.StripeAccount || !user.StripeAccount.accountId) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "No Stripe account found for user" });
    }

    // Check if user has sufficient balance
    const walletBalance = parseFloat(user.walletBalance);
    if (walletBalance < amount) {
      await transaction.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const amountInCents = Math.floor(amount * 100); // Convert to cents for Stripe
    const stripeAccount = user.StripeAccount;

    // Create a transfer using Stripe
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd", // Should be configurable
      destination: stripeAccount.accountId,
      description: `Withdrawal for ReferMe earnings - ${new Date().toISOString().split("T")[0]}`,
    });

    if (transfer && transfer.id) {
      // Record withdrawal in our database
      const withdrawal = await Withdrawal.create(
        {
          userId: user.id,
          stripeTransferId: transfer.id,
          amount,
          currency: "usd",
          status: transfer.status,
          stripeAccountId: stripeAccount.accountId,
          description: transfer.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction },
      );

      // Update user wallet balance
      user.walletBalance -= amount;
      await user.save({ transaction });

      // Record transaction in earnings history
      await EarningHistory.create(
        {
          userId: user.id,
          amount,
          type: "withdrawal",
          reference: withdrawal.id,
          description: `Withdrawal - ${transfer.id}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction },
      );

      // Commit transaction
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Withdrawal processed successfully",
        amount,
        withdrawalId: transfer.id,
        status: transfer.status,
      });
    } else {
      await transaction.rollback();
      return res
        .status(500)
        .json({ message: "Failed to create withdrawal with Stripe" });
    }
  } catch (error) {
    // Rollback transaction if there was an error
    await transaction.rollback();
    console.error("Error processing withdrawal:", error);
    return res
      .status(500)
      .json({
        message: "Failed to process withdrawal",
        error: error.message || "Unknown error",
      });
  }
};

export async function connectStripeAccount(req, res) {
  const { email, id: state } = req.user;
  console.log(process.env.STRIPE_OAUTH_CLIENT_ID);
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: process.env.STRIPE_OAUTH_CLIENT_ID,
    scope: "read_write",
    redirect_uri: `${process.env.SERVER_URL}/api/stripe/syncConnect`,
    "stripe_user[email]": email,
    state,
  });
  return res.json(
    `https://connect.stripe.com/oauth/authorize?${queryParams.toString()}`,
  );
}

export async function syncConnect(req, res) {
  const code = req.query.code;
  const userId = req.query.state;

  try {
    if (!code) {
      res.redirect(`${process.env.FRONT_END_URL}/earnings?error=missing_code`);
      throw new Error("[STRIPE SYNC CONNECT]: missing code");
    }

    if (!userId) {
      res.redirect(`${process.env.FRONT_END_URL}/earnings?error=missing_code`);
      throw new Error("[STRIPE SYNC CONNECT]: missing state(userId)");
    }

    let stripe_user_id;
    try {
      const _res = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });
      stripe_user_id = _res.stripe_user_id;
    } catch (error) {
      console.log("[STRIPE SYNC CONNECT]: ", error);
      return res.redirect(`${process.env.FRONT_END_URL}/earnings?error=stripe_error`);
    }

    if (!stripe_user_id) {
      console.log("[STRIPE SYNC CONNECT]: missing stripe_user_id");
      return res.redirect(
        `${process.env.FRONT_END_URL}/earnings?error=missing_stripe_user_id`,
      );
    }
    const stripeAccountData = {
      userId,
      accountId: stripe_user_id,
      status: "active",
    };
    await StripeAccount.create(stripeAccountData);
    return res.redirect(`${process.env.FRONT_END_URL}/earnings`);
  } catch (error) {
    console.log("[STRIPE SYNC CONNECT]: ", error);
    return res.redirect(`${process.env.FRONT_END_URL}/earnings?error=stripe_error`);
  }
}
