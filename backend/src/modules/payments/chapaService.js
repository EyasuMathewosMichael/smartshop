'use strict';

const axios = require('axios');
const crypto = require('crypto');
const { config } = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Initialize a Chapa payment for an order.
 *
 * @param {string} orderId - Order ID
 * @param {number} amountETB - Amount in ETB
 * @param {{email: string, firstName: string, lastName: string}} customerInfo - Customer info
 * @returns {Promise<{checkoutUrl: string, txRef: string}>}
 */
async function initializeChapaPayment(orderId, amountETB, customerInfo) {
  try {
    if (!config.chapaSecretKey) {
      const err = new Error('Chapa is not configured. Set CHAPA_SECRET_KEY to enable local payments.');
      err.statusCode = 503;
      throw err;
    }

    const txRef = `smartshop-${orderId}-${Date.now()}`;

    const body = {
      amount: amountETB.toFixed(2),
      currency: 'ETB',
      email: customerInfo.email,
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName,
      tx_ref: txRef,
      callback_url: `${config.frontendUrl}/checkout/success`,
      return_url: `${config.frontendUrl}/checkout/success?order_id=${orderId}`,
    };

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      body,
      {
        headers: {
          Authorization: `Bearer ${config.chapaSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`Chapa payment initialized for order ${orderId}: txRef=${txRef}`);
    return {
      checkoutUrl: response.data.data.checkout_url,
      txRef: body.tx_ref,
    };
  } catch (error) {
    logger.error('Error initializing Chapa payment:', error);
    throw error;
  }
}

/**
 * Verify a Chapa webhook signature.
 *
 * @param {object} payload - Webhook payload
 * @param {string} signature - x-chapa-signature header value
 * @returns {object} Verified payload
 */
function verifyChapaWebhook(payload, signature) {
  try {
    if (!config.chapaWebhookSecret) {
      const err = new Error('Chapa webhook secret is not configured.');
      err.statusCode = 503;
      throw err;
    }

    const hmac = crypto.createHmac('sha256', config.chapaWebhookSecret);
    hmac.update(JSON.stringify(payload));
    const computedSignature = hmac.digest('hex');

    const computedBuffer = Buffer.from(computedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (
      computedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(computedBuffer, signatureBuffer)
    ) {
      const error = new Error('Invalid Chapa webhook signature');
      error.statusCode = 400;
      throw error;
    }

    return payload;
  } catch (error) {
    logger.error('Chapa webhook verification failed:', error);
    throw error;
  }
}

/**
 * Verify a Chapa transaction by tx_ref.
 *
 * @param {string} txRef - Transaction reference
 * @returns {Promise<object>} Chapa transaction data
 */
async function verifyChapaTransaction(txRef) {
  try {
    if (!config.chapaSecretKey) {
      const err = new Error('Chapa is not configured.');
      err.statusCode = 503;
      throw err;
    }

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${config.chapaSecretKey}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    logger.error('Error verifying Chapa transaction:', error);
    throw error;
  }
}

module.exports = {
  initializeChapaPayment,
  verifyChapaWebhook,
  verifyChapaTransaction,
};
