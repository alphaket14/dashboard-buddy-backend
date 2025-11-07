import Business from "../models/business.js";
import BusinessEntity from "../models/businessEntity.js";
import EarningHistory from "../models/earningHistory.js";
import Referral from "../models/referral.js";
import User from "../models/user.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Webhook to handle successful referral signups.
 * Businesses call this endpoint when a user signs up with a referral link.
 */

export const handleReferralUpdateWebhook = async (req, res) => {
  try {
    console.log(req.body);
    const { referralCode, business } = req.body;
    const { id, name, ownerName, description, profileImageUrl } = business;

    // Validate request payload
    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    // Find the referral record
    const referral = await Referral.findOne({ where: { referralCode } });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    const businessEntity = await BusinessEntity.findByPk(id);

    if (!businessEntity) {
      throw new Error("BusinessEntity does not exist");
    }

    if (businessEntity.referrerId !== referral.referrerId)
      throw new Error("BusinessEntity does not belong to this referrer");

    await BusinessEntity.update(business, { where: { id } });

    // Respond to the business confirming receipt
    res.json({ message: "Referral update confirmed", referral });
  } catch (error) {
    console.log(error);
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleReferralWebhook = async (req, res) => {
  try {
    console.log(req.body);
    const { referralCode, business } = req.body;

    // Validate request payload
    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }
    if (!business) {
      return res.status(400).json({ message: "Business data is required" });
    }
    const { id, name, ownerName, description, profileImageUrl } = business;
    if (!id || !name || !ownerName) {
      return res.status(400).json({ message: "Missing required business fields" });
    }

    // Find the referral record
    const referral = await Referral.findOne({ where: { referralCode } });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referral.signups += 1;
    await referral.save(); // Save the updated referral

    const referrer = await User.findByPk(referral.referrerId);
    if (!referrer) {
      return res.status(404).json({ message: "Referrer not found" });
    }
    referrer.totalBusinessesReferred = referrer.totalBusinessesReferred + 1;
    await referrer.save();

    const businessEntityPayload = {
      id,
      name,
      ownerName,
      description,
      profileImageUrl,
      referrerId: referrer.id,
      platformId: referral.businessId,
    };

    await BusinessEntity.create(businessEntityPayload);

    // Respond to the business confirming receipt
    res.json({ message: "Referral registration confirmed", referral });
  } catch (error) {
    console.log(error);
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Webhook to handle successful purchases.
 * Businesses call this endpoint when a user makes a purchase with a referral link.
 */
export const handlePurchaseWebhook = async (req, res) => {
  try {
    const {
      referralCode,
      businessEntityId,
      stripePaymentId,
      serviceName,
      customerFirstName,
      customerLastName,
      serviceDate,
      paymentStatus,
      serviceFee,
      platformFee,
      businessName,
      transactionType = "regular",
    } = req.body;

    if (!referralCode || !serviceFee) {
      return res
        .status(400)
        .json({ message: "Referral code and Transaction amount is required" });
    }

    const referral = await Referral.findOne({
      where: { referralCode },
      include: [
        {
          model: Business,
          as: "business",
          attributes: ["platformFee", "name"],
          include: [
            {
              model: BusinessEntity,
              as: "platform",
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    const referrer = await User.findByPk(referral.referrerId);

    if (!referrer) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referrer.walletBalance = parseFloat(referrer.walletBalance) + parseFloat(platformFee);
    
    // Get payment available date from Stripe PaymentIntent
    let availableOn = null;
    if (stripePaymentId) {
      // Retrieve the PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);
      console.log("PaymentIntent:", paymentIntent);

      // Get the last charge from the PaymentIntent
      const lastChargeId = paymentIntent.latest_charge;
      if (lastChargeId) {
        // Retrieve the Charge
        const charge = await stripe.charges.retrieve(lastChargeId);

        console.log("Charge:", charge);
        // Get the balance transaction from the Charge
        if (charge.balance_transaction) {
          const balanceTransaction = await stripe.balanceTransactions.retrieve(charge.balance_transaction);

          // Get the available_on date (in numbers)
          availableOn = balanceTransaction.available_on;
        }
      }
    }

    console.log("Available on:", availableOn);

    await referrer.save();
    const earningPayload = {
      userId: referrer.id,
      amount: platformFee, // commission
      type: "referral",
      description: `Earned ${platformFee} - Business: ${businessName} - code: ${referralCode}`,
      stripePaymentId,
      paymentAvailableOn: availableOn ? new Date(availableOn * 1000) : null,
      serviceFee,
      customerFirstName,
      customerLastName,
      serviceDate,
      serviceName,
      businessName: businessName,
      totalFee: Number(serviceFee) + Number(platformFee),
      paymentStatus,
      businessEntityId: businessEntityId,
      transactionType,
    };

    await EarningHistory.create(earningPayload);

    res.json({ message: "Referral transaction recorded", referral });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const handleBusinessUpsertWebhook = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      logoUrl,
      url,
      platformFee,
      feeType,
      imIkonPlatformId,
    } = req.body;

    if (!imIkonPlatformId) {
      return res.status(400).json({
        success: false,
        message: "imIkonPlatformId is required.",
      });
    }

    const existingBusiness = await Business.findOne({
      where: { imIkonPlatformId },
    });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (url !== undefined) updateData.url = url;
    if (platformFee !== undefined) updateData.platformFee = platformFee;
    if (feeType !== undefined) updateData.feeType = feeType;

    let result;

    if (existingBusiness) {
      await existingBusiness.update(updateData);
      result = existingBusiness;
    } else {
      result = await Business.create({
        ...updateData,
        imIkonPlatformId,
      });
    }

    return res.status(200).json({
      success: true,
      message: existingBusiness
        ? "Business updated successfully."
        : "Business created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("handleBusinessUpsertWebhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
