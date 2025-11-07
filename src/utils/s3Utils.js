import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME;

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name
 * @param {string} mimeType - The MIME type of the file
 * @param {string} folder - Optional folder path inside the bucket
 * @returns {Promise<string>} The S3 key of the uploaded file
 */
export const uploadFileToS3 = async (fileBuffer, fileName, mimeType, folder = '') => {
  // Create a unique file name to prevent overwriting
  const fileExtension = fileName.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;

  // Construct the S3 key (path)
  const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

  // Set up the upload parameters
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    // Upload to S3
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return key;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Generate a permanent public URL for accessing a file in S3
 * @param {string} key - The S3 key of the file
 * @returns {string} Permanent public URL for the file
 */
export const getPublicFileUrl = (key) => {
  if (!key) return null;

  // If it's already a URL, return as is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  // Construct the public URL using the bucket name and key
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * Generate a signed URL for accessing a file in S3
 * @param {string} key - The S3 key of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>} Signed URL for the file
 */
export const getSignedFileUrl = async (key, expiresIn = 3600) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate file access URL');
  }
};

/**
 * Delete a file from S3
 * @param {string} key - The S3 key of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFileFromS3 = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};

