'use strict';

const { v2: cloudinary } = require('cloudinary');
const { config } = require('../config/env');
const logger = require('./logger');

// Configure Cloudinary using environment-derived config
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudStorageKey,
  api_secret: config.cloudStorageBucket,
});

/**
 * Upload a single file buffer to Cloudinary via upload_stream.
 *
 * @param {{ buffer: Buffer, mimetype: string }} file
 * @returns {Promise<{ url: string, publicId: string }>}
 */
function uploadSingleFile(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
}

/**
 * Upload an array of file objects to Cloudinary.
 * On partial failure, already-uploaded images are deleted before throwing.
 *
 * @param {Array<{ buffer: Buffer, mimetype: string }>} files
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
async function uploadImages(files) {
  const uploaded = [];
  try {
    for (const file of files) {
      const result = await uploadSingleFile(file);
      uploaded.push(result);
    }
    return uploaded;
  } catch (error) {
    logger.error('Error uploading images, rolling back already-uploaded files', {
      error: error.message,
      uploadedCount: uploaded.length,
    });
    // Clean up already-uploaded images
    for (const { publicId } of uploaded) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cleanupError) {
        logger.error('Failed to delete image during rollback', {
          publicId,
          error: cleanupError.message,
        });
      }
    }
    throw error;
  }
}

/**
 * Delete an image from Cloudinary by its public ID.
 *
 * @param {string} publicId
 * @returns {Promise<object>}
 */
async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Error deleting image from Cloudinary', {
      publicId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Generate a Cloudinary thumbnail URL for the given public ID.
 *
 * @param {string} publicId
 * @param {number} [width=200]
 * @param {number} [height=200]
 * @returns {string}
 */
function generateThumbnail(publicId, width = 200, height = 200) {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}

module.exports = {
  uploadImages,
  deleteImage,
  generateThumbnail,
};
