'use strict';

const multer = require('multer');
const { validateFileUpload } = require('../utils/validation');

// Use memory storage so files are stored in buffer (not disk)
const storage = multer.memoryStorage();

/**
 * File filter that validates MIME type and size.
 * Only JPEG, PNG, and WebP images are allowed.
 */
function fileFilter(req, file, cb) {
  const isValid = validateFileUpload(file.mimetype, file.size || 0);
  if (!isValid) {
    return cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
  cb(null, true);
}

// Configure multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Export convenience middleware for single and multiple uploads
const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 5); // max 5 images

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
};
