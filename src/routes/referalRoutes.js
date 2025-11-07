import express from "express";
import {
  createReferral,
  getReferrals,
  markReferralRegistered,
  markPurchaseMade,
  deleteReferral,
} from "../controllers/referralController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Referrals
 *   description: Referral management
 */

/**
 * @swagger
 * /api/referrals:
 *   post:
 *     summary: Create a new referral
 *     tags: [Referrals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referrerId:
 *                 type: integer
 *               businessId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Referral created
 *       404:
 *         description: User or Business not found
 *       500:
 *         description: Internal server error
 */
router.post("/", createReferral);

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Get all referrals with filtering & pagination
 *     tags: [Referrals]
 *     parameters:
 *       - in: query
 *         name: referrerId
 *         schema:
 *           type: integer
 *         description: Referrer ID
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: integer
 *         description: Business ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of referrals
 *       500:
 *         description: Internal server error
 */
router.get("/", getReferrals);

/**
 * @swagger
 * /api/referrals/register:
 *   post:
 *     summary: Mark referral as registered
 *     tags: [Referrals]
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
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Internal server error
 */
router.post("/register", markReferralRegistered);

/**
 * @swagger
 * /api/referrals/purchase:
 *   post:
 *     summary: Mark purchase as made
 *     tags: [Referrals]
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
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Internal server error
 */
router.post("/purchase", markPurchaseMade);

/**                  
 * @swagger
 * /api/referrals/{id}:
 *   delete:
 *     summary: Delete a referral
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Referral ID
 *     responses:
 *       200:
 *         description: Referral deleted
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteReferral);

export default router;