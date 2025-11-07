import { getSignedFileUrl, getPublicFileUrl } from './s3Utils.js';

/**
 * Enhance user object with profile image URL
 * @param {Object} user - User object from database
 * @returns {Promise<Object>} User object with profile image URL
 */
export const enhanceUserWithProfileImage = async (userObj) => {
  // Create a copy of the user object to avoid modifying the original
  const user = { ...userObj };
                                         
  // If the user has a profile image, ensure it's a permanent URL
  if (user.profileImageUrl) {
    // Check if it's already a permanent URL (starts with https://)
    if (user.profileImageUrl.startsWith('https://')) {
      // It's already a permanent URL, no need to change
      user.profileImageUrlSigned = user.profileImageUrl;
    } else {
      // It's an S3 key, generate permanent URL
      user.profileImageUrlSigned = getPublicFileUrl(user.profileImageUrl);
    }
  }

  return user;
};