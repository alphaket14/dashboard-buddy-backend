import express from 'express';
import { uploadProfileImage, deleteProfileImage } from '../controllers/fileController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Upload profile image - single file with field name 'image'
router.post('/profile-image', protect, upload.single('image'), uploadProfileImage);

// Delete profile image
router.delete('/profile-image',protect, deleteProfileImage);



                 

export default router;