'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
      },
      addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required'],
      },
      addressLine2: {
        type: String,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'chapa'],
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: {
        type: String,
      },
      paymentGateway: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      currency: {
        type: String,
      },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],
    trackingInfo: {
      carrier: {
        type: String,
      },
      trackingNumber: {
        type: String,
      },
      estimatedDelivery: {
        type: Date,
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
    },
    currency: {
      type: String,
      enum: ['USD', 'ETB'],
      required: [true, 'Currency is required'],
    },
    exchangeRate: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Single field indexes (orderNumber unique index is already created by the unique: true field option)
orderSchema.index({ userId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: 1 });

// Compound indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
