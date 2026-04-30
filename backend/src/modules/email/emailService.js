'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const EmailLog = require('../../models/EmailLog');
const { config } = require('../../config/env');
const logger = require('../../utils/logger');

// Configure nodemailer transporter using SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: config.emailServiceApiKey,
  },
});

/**
 * Send an email using a template.
 *
 * @param {string} recipient - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} templateName - Template file name (without .html extension)
 * @param {object} data - Template data for placeholder replacement
 * @returns {Promise<boolean>} True if sent successfully
 */
async function sendEmail(recipient, subject, templateName, data) {
  // Create email log with pending status
  const emailLog = await EmailLog.create({
    recipient,
    subject,
    template: templateName,
    status: 'pending',
    attempts: 0,
  });

  try {
    // Read template file
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace {{key}} placeholders with data values
    if (data) {
      Object.keys(data).forEach((key) => {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        html = html.replace(placeholder, data[key] !== undefined ? data[key] : '');
      });
    }

    // Send email
    await transporter.sendMail({
      from: `SmartShop <${process.env.SENDGRID_FROM_EMAIL || 'noreply@smartshop.com'}>`,
      to: recipient,
      subject,
      html,
    });

    // Update log to sent
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    emailLog.lastAttempt = new Date();
    emailLog.attempts += 1;
    await emailLog.save();

    logger.info(`Email sent: template=${templateName}, recipient=${recipient}`);
    return true;
  } catch (error) {
    // Update log to failed
    emailLog.status = 'failed';
    emailLog.error = error.message;
    emailLog.lastAttempt = new Date();
    emailLog.attempts += 1;
    await emailLog.save();

    logger.error(`Email failed: template=${templateName}, recipient=${recipient}`, error);
    return false;
  }
}

/**
 * Retry all failed emails that have fewer than 3 attempts.
 *
 * @returns {Promise<void>}
 */
async function retryFailedEmails() {
  try {
    const failedEmails = await EmailLog.find({
      status: 'failed',
      attempts: { $lt: 3 },
    });

    logger.info(`Retrying ${failedEmails.length} failed emails`);

    for (const emailLog of failedEmails) {
      await sendEmail(emailLog.recipient, emailLog.subject, emailLog.template, {});
    }
  } catch (error) {
    logger.error('Error retrying failed emails:', error);
  }
}

/**
 * Send a welcome email to a new user.
 *
 * @param {string} userEmail - User email address
 * @param {string} userName - User name
 * @returns {Promise<boolean>}
 */
async function sendWelcomeEmail(userEmail, userName) {
  return sendEmail(userEmail, 'Welcome to SmartShop!', 'welcome', { userName });
}

/**
 * Send an order confirmation email.
 *
 * @param {string} userEmail - User email address
 * @param {object} orderDetails - Order details
 * @returns {Promise<boolean>}
 */
async function sendOrderConfirmation(userEmail, orderDetails) {
  const itemsFormatted = orderDetails.items
    ? orderDetails.items
        .map((item) => `${item.name} x${item.quantity} - $${item.price}`)
        .join(', ')
    : '';

  return sendEmail(userEmail, `Order Confirmation - #${orderDetails.orderNumber}`, 'orderConfirmation', {
    orderNumber: orderDetails.orderNumber,
    items: itemsFormatted,
    total: orderDetails.total,
    paymentMethod: orderDetails.paymentMethod,
  });
}

/**
 * Send a shipping notification email.
 *
 * @param {string} userEmail - User email address
 * @param {object} orderDetails - Order details
 * @param {object} trackingInfo - Tracking information
 * @returns {Promise<boolean>}
 */
async function sendShippingNotification(userEmail, orderDetails, trackingInfo) {
  return sendEmail(
    userEmail,
    `Your Order #${orderDetails.orderNumber} Has Shipped!`,
    'shippingNotification',
    {
      orderNumber: orderDetails.orderNumber,
      trackingNumber: trackingInfo.trackingNumber,
      carrier: trackingInfo.carrier,
      estimatedDelivery: trackingInfo.estimatedDelivery
        ? new Date(trackingInfo.estimatedDelivery).toLocaleDateString()
        : 'TBD',
    }
  );
}

/**
 * Send a delivery confirmation email.
 *
 * @param {string} userEmail - User email address
 * @param {object} orderDetails - Order details
 * @returns {Promise<boolean>}
 */
async function sendDeliveryConfirmation(userEmail, orderDetails) {
  return sendEmail(
    userEmail,
    `Your Order #${orderDetails.orderNumber} Has Been Delivered!`,
    'deliveryConfirmation',
    {
      orderNumber: orderDetails.orderNumber,
      deliveredAt: new Date().toLocaleDateString(),
    }
  );
}

/**
 * Send a password reset email.
 *
 * @param {string} userEmail - User email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>}
 */
async function sendPasswordResetEmail(userEmail, resetToken) {
  const resetLink = `${config.frontendUrl}/reset-password/${resetToken}`;
  return sendEmail(userEmail, 'Reset Your SmartShop Password', 'passwordReset', {
    resetLink,
  });
}

/**
 * Start the email retry scheduler (runs every 5 minutes).
 */
function startEmailRetryScheduler() {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running email retry scheduler');
    await retryFailedEmails();
  });
  logger.info('Email retry scheduler started');
}

module.exports = {
  sendEmail,
  retryFailedEmails,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendShippingNotification,
  sendDeliveryConfirmation,
  sendPasswordResetEmail,
  startEmailRetryScheduler,
};
