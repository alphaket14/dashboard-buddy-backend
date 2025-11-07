import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import Referral from "../models/referral.js";
import Business from "../models/business.js";
import User from "../models/user.js";
import EarningHistory from "../models/earningHistory.js";

/**
 * Generate a referral link for a user & business
 */
export const createReferral = async (req, res) => {
  try {
    const { referrerId, businessId } = req.body;

    // Ensure referrer and business exist
    const user = await User.findByPk(referrerId);
    const business = await Business.findByPk(businessId);
    if (!user || !business) {
      return res.status(404).json({ message: "User or Business not found" });
    }
    let referral = await Referral.findOne({
      where: { referrerId, businessId },
    });
    console.log({ user, business });
    console.log({ referral });
    if (!referral) {
      const referralCode = uuidv4().substring(0, 8);
      const referralLink = `${business.url}signup?ref=${referralCode}`;
      const destinationUrl = `${business.url}signup?ref=${referralCode}`;

      // Create referral entry
      referral = await Referral.create({
        referrerId,
        referralCode,
        businessId,
        referralLink,
        destinationUrl,
      });
    }
    res.status(201).json({ message: "Referral created", referral: referral });
    return;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all referrals with filtering & pagination
 */
export const getReferrals = async (req, res) => {
  try {
    const { referrerId, businessId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const parsedReferrerId = referrerId ? parseInt(referrerId, 10) : null;
    const parsedBusinessId = businessId ? parseInt(businessId, 10) : null;

    const whereClause = {};
    if (parsedReferrerId) whereClause.referrerId = parsedReferrerId;
    if (parsedBusinessId) whereClause.businessId = parsedBusinessId;

    // Fetch paginated referrals
    const referrals = await Referral.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Business,
          attributes: [
            "id",
            "name",
            "categoryId",
            "logoUrl",
            "description",
            "url",
          ],
        },
      ],
    });

    // Calculate next payment amount
    const earnings = await EarningHistory.findAll({
      where: {
        userId: parsedReferrerId,
      },
      attributes: ["amount", "paymentStatus"],
    });

    const nextPaymentAmount = earnings.reduce((total, earning) => {
      const totalNum = Number(total) || 0;
      const amountNum = Number(earning.amount) || 0;
      if (earning.paymentStatus === "pending") {
      return totalNum + amountNum;
      }
      return totalNum;
    }, 0);

    // Add dynamic status to each referral
    const referralsWithStatus = referrals.rows.map((referral) => {
      let status = "All";
      if (referral.rewardAmount > 0) {
        status = "Completed";
      } else if (referral.signups > 0) {
        status = "Pending";
      }
      return { ...referral.toJSON(), status };
    });

    // Get the user's earnings and total businesses referred
    const user = await User.findByPk(parsedReferrerId);
    const totalEarned = user?.totalEarnings || 0;
    const totalReferredBusinesses = user?.totalBusinessesReferred || 0;
    // const nextPaymentAmount = referralsWithStatus

    res.json({
      total: referrals.count,
      totalPages: Math.ceil(referrals.count / limit),
      totalEarned,
      totalReferredBusinesses,
      nextPaymentAmount,
      referrals: referralsWithStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Webhook: Mark referral as registered
 */
export const markReferralRegistered = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const referral = await Referral.findOne({ where: { referralCode } });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referral.signups += 1;
    await referral.save();

    res.json({ message: "Referral registration confirmed", referral });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle purchase event
 */
export const markPurchaseMade = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const referral = await Referral.findOne({ where: { referralCode } });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referral.purchaseMade = true;
    await referral.save();

    res.json({ message: "Purchase marked as made", referral });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a referral
 */
export const deleteReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Referral.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Referral not found" });
    }

    res.json({ message: "Referral deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function referralEndpointHandler(req, res) {
  const refCode = req.query.ref;
  if (!refCode) throw new Error("Invalid URL");
  try {
    const referral = await Referral.findOne({
      where: { referralCode: refCode },
    });
    if (!referral) throw new Error("Invalid URL");
    res.redirect(`${referral.destinationUrl}?referralCode=${refCode}`);
  } catch (error) {
    console.error("REFER ENDPOINT", error);
    res.status(500).json({ message: error.message });
  }
}
