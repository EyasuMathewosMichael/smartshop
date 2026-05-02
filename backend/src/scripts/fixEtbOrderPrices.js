'use strict';

/**
 * One-time migration: fix ETB orders that have item prices stored in USD.
 * Fetches the latest exchange rate and converts item prices + sets exchangeRate field.
 *
 * Run with: node src/scripts/fixEtbOrderPrices.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Order = require('../models/Order');
const ExchangeRate = require('../models/ExchangeRate');
const { config } = require('../config/env');

async function run() {
  await mongoose.connect(config.mongodbUri);
  console.log('Connected to MongoDB');

  // Get latest exchange rate
  const rateDoc = await ExchangeRate.findOne().sort({ fetchedAt: -1 });
  if (!rateDoc) {
    console.error('No exchange rate found in DB. Run the server first to fetch one.');
    process.exit(1);
  }
  const rate = rateDoc.rate;
  console.log(`Using exchange rate: ${rate} ETB/USD`);

  // Find all ETB orders without exchangeRate set
  const orders = await Order.find({ currency: 'ETB', exchangeRate: null });
  console.log(`Found ${orders.length} ETB orders to fix`);

  for (const order of orders) {
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0) || 1;
    const avgETBUnit = order.total / totalQty;

    let fixed = false;
    for (const item of order.items) {
      // If item price looks like USD (much smaller than ETB equivalent)
      if (item.price < avgETBUnit * 0.1) {
        item.price = parseFloat((item.price * rate).toFixed(2));
        fixed = true;
      }
    }

    order.exchangeRate = rate;

    if (fixed) {
      await order.save();
      console.log(`Fixed order ${order.orderNumber} (${order._id})`);
    } else {
      // Just set the exchangeRate field
      await Order.updateOne({ _id: order._id }, { $set: { exchangeRate: rate } });
      console.log(`Set exchangeRate on order ${order.orderNumber} (no price fix needed)`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
