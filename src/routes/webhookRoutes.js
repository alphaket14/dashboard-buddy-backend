import express from "express";
import {
  handleReferralWebhook,
  handlePurchaseWebhook,
  handleReferralUpdateWebhook,
  handleBusinessUpsertWebhook,
} from "../controllers/webhookController.js";
import { handleStripeWebhook } from "../controllers/stripeWebhookController.js";

const router = express.Router();
// Custom middleware to preserve the raw body for webhook signature verification
const preserveRawBody = (req, res, next) => {
  let data = "";

  req.setEncoding("utf8");

  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    req.rawBody = data;
    next();
  });
};

/**
 * @swagger
 * /api/webhooks/referral:
 *   post:
 *     summary: Handle referral signup webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referralCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Referral registration confirmed
 *       400:
 *         description: Referral code is required
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Internal server error
 */
router.post("/referral", handleReferralWebhook);

router.post("/referral/update", handleReferralUpdateWebhook);

/**
 * @swagger
 * /api/webhooks/purchase:
 *   post:
 *     summary: Handle purchase webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referralCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase marked as made
 *       400:
 *         description: Referral code is required
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Internal server error
 */
router.post("/purchase", handlePurchaseWebhook);
router.post("/businessUpsert", handleBusinessUpsertWebhook);

// Stripe webhook endpoint
router.post("/stripe", handleStripeWebhook);

export default router;
