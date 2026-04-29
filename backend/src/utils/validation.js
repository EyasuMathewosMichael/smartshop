'use strict';

const sanitizeHtmlLib = require('sanitize-html');

/**
 * Strip ALL HTML/script tags from a string, returning plain text.
 * If input is not a string, returns it unchanged.
 *
 * @param {*} input
 * @returns {*}
 */
function sanitizeHtml(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return sanitizeHtmlLib(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Check that a numeric value falls within [min, max] (inclusive).
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function validateNumericRange(value, min, max) {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Validate that a file upload has an allowed image MIME type and does not
 * exceed the 5 MB size limit.
 *
 * @param {string} mimetype
 * @param {number} sizeBytes
 * @returns {boolean}
 */
function validateFileUpload(mimetype, sizeBytes) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5 MB
  return allowedTypes.includes(mimetype) && sizeBytes <= maxSize;
}

/**
 * Check that a value is a string whose length does not exceed maxLength.
 *
 * @param {*} str
 * @param {number} maxLength
 * @returns {boolean}
 */
function validateStringLength(str, maxLength) {
  return typeof str === 'string' && str.length <= maxLength;
}

/**
 * Validate arbitrary data against a Joi schema.
 *
 * @param {*} data
 * @param {import('joi').Schema} schema
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSchema(data, schema) {
  const { error } = schema.validate(data, { abortEarly: false });
  if (!error) {
    return { valid: true, errors: [] };
  }
  const errors = error.details.map((d) => d.message);
  return { valid: false, errors };
}

module.exports = {
  sanitizeHtml,
  validateNumericRange,
  validateFileUpload,
  validateStringLength,
  validateSchema,
};
