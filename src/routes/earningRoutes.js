import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getAllEarningHistory, getAllEarningHistoryWithYearData, getEarningHistoryById, getEarningHistoryByUserId } from '../controllers/earningHistoryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Earning 
 *   description: API for managing user earning 
 */

/**
 * @swagger
 * /api/earning/history:
 *   get:
 *     summary: Get earning history for the authenticated user
 *     tags: [Earning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earning history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the earning history record
 *                   userId:
 *                     type: string
 *                     description: The ID of the user
 *                   amount:
 *                     type: number
 *                     description: The amount earned or withdrawn
 *                   type:
 *                     type: string
 *                     description: The type of transaction (e.g., earning, withdrawal)
 *                   reference:
 *                     type: number
 *                     description: Reference ID for the transaction
 *                   description:
 *                     type: string
 *                     description: Description of the transaction
 *       400:
 *         description: Bad request (e.g., missing user ID)
 *       500:
 *         description: Internal server error
 */
router.get('/history', protect, getEarningHistoryByUserId);

router.get('/',getAllEarningHistory);

router.get('/withYearData',getAllEarningHistoryWithYearData)

router.get('/:id',getEarningHistoryById)

export default router;
