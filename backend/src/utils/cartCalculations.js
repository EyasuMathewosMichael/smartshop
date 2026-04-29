'use strict';

/**
 * Calculate the cart total from an array of items.
 *
 * @param {Array<{price: number, quantity: number}>} items
 * @returns {{subtotal: number, total: number}}
 */
function calculateCartTotal(items) {
  if (!items || items.length === 0) {
    return { subtotal: 0, total: 0 };
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  return {
    subtotal,
    total: subtotal, // Tax/shipping added later at order creation
  };
}

/**
 * Validate that a product has sufficient stock for the requested quantity.
 *
 * @param {{stock: number, isAvailable: boolean}} product
 * @param {number} requestedQty
 * @returns {boolean}
 */
function validateProductAvailability(product, requestedQty) {
  return (
    product.stock >= requestedQty &&
    product.stock > 0 &&
    product.isAvailable === true
  );
}

/**
 * Validate availability of all items in a cart.
 *
 * @param {Array<{productId: string, quantity: number}>} cartItems
 * @param {Map<string, object>|object} products - Map or object keyed by productId string
 * @returns {Array<{productId: string, reason: string}>} Array of unavailable items with reasons
 */
function validateCartAvailability(cartItems, products) {
  const unavailableItems = [];

  for (const item of cartItems) {
    const productId = item.productId.toString();
    const product = products instanceof Map ? products.get(productId) : products[productId];

    if (!product) {
      unavailableItems.push({ productId, reason: 'Product not found' });
      continue;
    }

    if (product.stock === 0) {
      unavailableItems.push({ productId, reason: 'Out of stock' });
      continue;
    }

    if (product.stock < item.quantity) {
      unavailableItems.push({
        productId,
        reason: `Insufficient stock (available: ${product.stock})`,
      });
      continue;
    }

    if (!product.isAvailable) {
      unavailableItems.push({ productId, reason: 'Out of stock' });
    }
  }

  return unavailableItems;
}

module.exports = {
  calculateCartTotal,
  validateProductAvailability,
  validateCartAvailability,
};
