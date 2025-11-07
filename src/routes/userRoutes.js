import express from "express";
import UserController from "../controllers/userController.js";
import multer from 'multer';
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer(); 

const { getAllUsers, getUserById, updateUser, deleteUser, deleteAllUsers, getUserForAdmin } = UserController;


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user
 *       404:
 *         description: User not found
 */
router.get("/details",protect, getUserById);


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID, including profile picture upload
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file (image)
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put("/:id", upload.single('profilePicture'),updateUser);


/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", deleteUser);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Delete all users
 *     responses:
 *       200:
 *         description: All users deleted successfully
 */
router.delete("/", deleteAllUsers);

router.get("/:id",getUserForAdmin);

export default router;
