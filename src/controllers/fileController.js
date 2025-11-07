import { uploadFileToS3, getSignedFileUrl, deleteFileFromS3, getPublicFileUrl } from '../utils/s3Utils.js';
import User from '../models/user.js';

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to S3
    const s3Key = await uploadFileToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'profile-images'
    );

    // Generate permanent public URL
    const permanentImageUrl = getPublicFileUrl(s3Key);

    // Update user profile image URL in database with permanent URL
    await User.update(
      { profileImageUrl: permanentImageUrl },
      { where: { id: req.user.id } }
    );

    // Generate temporary signed URL for immediate use (optional)
    const imageUrl = await getSignedFileUrl(s3Key);

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      imageUrl: permanentImageUrl, // Return permanent URL
      temporaryUrl: imageUrl, // Return temporary URL for immediate use
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ error: error.message || 'Failed to upload profile image' });
  }
};

export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user.profileImageUrl) {
      return res.status(400).json({ error: 'No profile image to delete' });
    }

    // Extract S3 key from the permanent URL for deletion
    const urlParts = user.profileImageUrl.split('/');
    const s3Key = urlParts.slice(-1)[0]; // Get the filename part
    const folderPath = urlParts.slice(-2, -1)[0]; // Get the folder part
    const fullS3Key = `${folderPath}/${s3Key}`;

    // Delete file from S3
    await deleteFileFromS3(fullS3Key);

    // Update user record
    await User.update(
      { profileImageUrl: null },
      { where: { id: req.user.id } }
    );

    res.status(200).json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    res.status(500).json({ error: error.message || 'Failed to delete profile image' });
  }
};
