'use strict';

const axios = require('axios');
const cron = require('node-cron');
const ExchangeRate = require('../models/ExchangeRate');
const { config } = require('../config/env');
const logger = require('./logger');

/**
 * Fetch the latest USD to ETB exchange rate from exchangerate-api.com
 * and store it in the database.
 *
 * @returns {Promise<object>} The saved ExchangeRate document
 */
async function fetchAndStoreExchangeRate() {
  try {
    const url = `https://v6.exchangerate-api.com/v6/${config.exchangeRateApiKey}/pair/USD/ETB`;
    const response = await axios.get(url);

    const exchangeRate = new ExchangeRate({
      baseCurrency: 'USD',
      targetCurrency: 'ETB',
      rate: response.data.conversion_rate,
      source: 'exchangerate-api.com',
    });

    await exchangeRate.save();
    logger.info(`Exchange rate fetched and stored: ${exchangeRate.rate}`);
    return exchangeRate;
  } catch (error) {
    logger.error('Error fetching exchange rate:', error);
    throw error;
  }
}

/**
 * Get the latest exchange rate from the database.
 * If none found, attempts to fetch a new one.
 * Falls back to hardcoded rate of 56.5 if all else fails.
 *
 * @returns {Promise<number>} The exchange rate
 */
async function getLatestRate() {
  try {
    // Try to find the most recent rate
    const latestRate = await ExchangeRate.findOne()
      .sort({ fetchedAt: -1 })
      .limit(1);

    if (latestRate) {
      return latestRate.rate;
    }

    // No rate found, try to fetch one
    logger.info('No exchange rate found in database, fetching new one');
    const newRate = await fetchAndStoreExchangeRate();
    return newRate.rate;
  } catch (error) {
    logger.error('Error getting latest rate, falling back to hardcoded rate:', error);
    // Fall back to hardcoded rate
    return 56.5;
  }
}

/**
 * Convert USD amount to ETB using the provided exchange rate.
 *
 * @param {number} amountUSD - Amount in USD
 * @param {number} rate - Exchange rate
 * @returns {number} Amount in ETB
 */
function convertUSDtoETB(amountUSD, rate) {
  if (typeof amountUSD !== 'number' || amountUSD < 0) {
    throw new Error('Amount must be a positive number');
  }
  if (typeof rate !== 'number' || rate <= 0) {
    throw new Error('Rate must be a positive number');
  }
  return amountUSD * rate;
}

/**
 * Start a cron job to fetch and store exchange rates daily at midnight.
 */
function startExchangeRateScheduler() {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled exchange rate fetch');
    try {
      await fetchAndStoreExchangeRate();
    } catch (error) {
      logger.error('Scheduled exchange rate fetch failed:', error);
    }
  });
  logger.info('Exchange rate scheduler started (runs daily at midnight)');
}

module.exports = {
  fetchAndStoreExchangeRate,
  getLatestRate,
  convertUSDtoETB,
  startExchangeRateScheduler,
};
