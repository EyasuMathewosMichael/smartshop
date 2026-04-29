'use strict';

/**
 * Generate a unique order number in the format SS-YYYYMMDD-XXXXX
 * where XXXXX is 5 random uppercase alphanumeric characters.
 *
 * @returns {string} Order number
 */
function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Generate 5 random uppercase alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `SS-${datePart}-${randomPart}`;
}

/**
 * Calculate order totals including subtotal, tax, shipping, and total.
 * Applies currency conversion if currency is ETB.
 *
 * @param {Array<{price: number, quantity: number}>} items - Order items
 * @param {string} currency - Currency code ('USD' or 'ETB')
 * @param {number} exchangeRate - Exchange rate for USD to ETB conversion
 * @returns {{subtotal: number, tax: number, shippingCost: number, total: number}}
 */
function calculateOrderTotal(items, currency, exchangeRate) {
  // Calculate subtotal
  let subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  // Tax (0% for now)
  const tax = subtotal * 0.0;

  // Shipping cost: free if subtotal > $50, otherwise $5.99
  let shippingCost = subtotal > 50 ? 0 : 5.99;

  // Calculate total
  let total = subtotal + tax + shippingCost;

  // Convert to ETB if needed
  if (currency === 'ETB') {
    subtotal = subtotal * exchangeRate;
    shippingCost = shippingCost * exchangeRate;
    total = total * exchangeRate;
  }

  return {
    subtotal,
    tax,
    shippingCost,
    total,
  };
}

/**
 * Validate if a status transition is allowed.
 * Valid transitions: pending→paid, paid→shipped, shipped→delivered
 *
 * @param {string} currentStatus - Current order status
 * @param {string} nextStatus - Desired next status
 * @returns {boolean} True if transition is valid
 */
function isValidStatusTransition(currentStatus, nextStatus) {
  const validTransitions = {
    pending: ['paid'],
    paid: ['shipped'],
    shipped: ['delivered'],
    delivered: [],
  };

  return validTransitions[currentStatus]?.includes(nextStatus) || false;
}

module.exports = {
  generateOrderNumber,
  calculateOrderTotal,
  isValidStatusTransition,
};
