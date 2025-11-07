import express from "express";
import { sendContactEmail } from "../controllers/contactController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactEmail:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *         - message
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the sender
 *         lastName:
 *           type: string
 *           description: Last name of the sender
 *         email:
 *           type: string
 *           description: Email address of the sender
 *         phone:
 *           type: string
 *           description: Phone number of the sender
 *         message:
 *           type: string
 *           description: Message content
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phone: 123-456-7890
 *         message: Hello, this is a test message.
 */

/**
 * @swagger
 * /send-email:
 *   post:
 *     summary: Send a contact email
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactEmail'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email sent successfully!
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields (firstName, lastName, email, phone, message) are required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error. Please try again later.
 */

router.post("/send-email", sendContactEmail);
  
  export default router;
