'use strict';

const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  template: {
    type: String,
    required: [true, 'Template is required'],
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastAttempt: {
    type: Date,
  },
  error: {
    type: String,
  },
  sentAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ createdAt: 1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
