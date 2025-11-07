import multer from 'multer';

// Configure multer for memory storage (files will be in memory as Buffer)
const storage = multer.memoryStorage();

// File filter for validating file types
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure upload settings
export const upload = multer({
  storage,
  fileFilter,                                                                                                                            
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});
export default upload;