'use strict';

// Vercel Node.js serverless function (ikke Edge Runtime — Edge understøtter ikke
// de rå TLS-sockets, som SMTP.dk-klienten i lib/smtpClient.js kræver).
const { createFeedbackHandler } = require('../lib/feedbackHandler');
const { sendFeedbackEmail } = require('../lib/mailSender');
const { createRateLimiter } = require('../lib/rateLimiter');

module.exports = createFeedbackHandler({
  sendFeedbackEmail: sendFeedbackEmail,
  rateLimiter: createRateLimiter()
});
