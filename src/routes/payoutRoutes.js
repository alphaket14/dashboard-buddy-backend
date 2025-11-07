import express from 'express';
import {
  processWeeklyPayouts,
  processManualPayout,
  getPayoutHistory,
  checkPayoutStatus,
  getPayoutStats,
} from '../controllers/payoutController.js';
// import { admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payouts
 *   description: Payout management
 */

/**
 * @swagger
 * /api/payouts/weekly:
 *   post:
 *     summary: Process weekly payouts (triggered by cron job)
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly payouts processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/weekly', processWeeklyPayouts);

/**
 * @swagger
 * /api/payouts/manual:
 *   post:
 *     summary: Process a manual payout for a specific user
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               amount:
 *                 type: number
 *                 description: The amount to payout
 *     responses:
 *       200:
 *         description: Manual payout processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/manual', processManualPayout);

/**
 * @swagger
 * /api/payouts/history/{userId}:
 *   get:
 *     summary: Get payout history for a specific user
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Payout history retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/history/:userId', getPayoutHistory);

/**
 * @swagger
 * /api/payouts/status/{payoutId}:
 *   get:
 *     summary: Check status of a specific payout
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payoutId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the payout
 *     responses:
 *       200:
 *         description: Payout status retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Payout not found
 *       500:
 *         description: Internal server error
 */
router.get('/status/:payoutId', checkPayoutStatus);

/**
 * @swagger
 * /api/payouts/stats:
 *   get:
 *     summary: Get overall payout statistics (admin only)
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payout statistics retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/stats', getPayoutStats);

export default router;
