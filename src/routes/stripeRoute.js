import express from 'express';
import { connectStripeAccount, processWithdrawal, syncConnect } from '../controllers/stripeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Withdrawals
 *   description: Withdrawal management
 */

/**
 * @swagger
 * /api/stripe/withdraw:
 *   post:
 *     summary: Process a withdrawal for a specific user
 *     tags: [Withdrawals]
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
 *                 description: The amount to withdraw
 *     responses:
 *       200:
 *         description: Withdrawal processed
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/', processWithdrawal);

/**
 * @swagger
 * /api/stripe/connect:
 *   get:
 *     summary: Connect a user's Stripe account
 *     tags: [Stripe Connect]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stripe OAuth URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: URL for Stripe OAuth authorization
 *       500:
 *         description: Internal server error
 */

router.get("/connect",protect,connectStripeAccount);


/**
 * @swagger
 * /api/stripe/syncConnect:
 *   get:
 *     summary: Sync Stripe account connection after OAuth
 *     tags: [Stripe Connect]
 *     parameters:
 *       - name: code
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The authorization code returned by Stripe
 *       - name: state
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID passed during the OAuth process
 *     responses:
 *       302:
 *         description: Redirects to the frontend URL after syncing Stripe account
 *       400:
 *         description: Missing code or state (user ID)
 *       500:
 *         description: Internal server error
 */
router.get('/syncConnect',syncConnect);

export default router;
