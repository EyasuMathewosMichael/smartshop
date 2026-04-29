'use strict';

const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    default: 'USD',
  },
  targetCurrency: {
    type: String,
    default: 'ETB',
  },
  rate: {
    type: Number,
    required: [true, 'Exchange rate is required'],
    min: [0, 'Exchange rate cannot be negative'],
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
  },
});

// Index on fetchedAt (descending) for retrieving latest rate
exchangeRateSchema.index({ fetchedAt: -1 });

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

module.exports = ExchangeRate;
