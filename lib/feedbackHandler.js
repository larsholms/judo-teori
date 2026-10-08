'use strict';

const { validateFeedback } = require('./feedbackValidation');

function getClientIp(req) {
  const vercelForwarded = req.headers && req.headers['x-vercel-forwarded-for'];
  if (typeof vercelForwarded === 'string' && vercelForwarded.length) {
    return vercelForwarded.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (err) { return {}; }
  }
  return {};
}

function createFeedbackHandler(deps) {
  const sendFeedbackEmail = deps.sendFeedbackEmail;
  const rateLimiter = deps.rateLimiter;
  const now = deps.now || Date.now;
  const logger = deps.logger || console;
  const env = deps.env || process.env;

  return async function handleFeedback(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Metoden er ikke tilladt.' });
      return;
    }

    const ip = getClientIp(req);
    if (rateLimiter.isRateLimited(ip, now())) {
      res.status(429).json({ error: 'For mange forsøg. Prøv igen om lidt.' });
      return;
    }

    const body = parseBody(req);
    const { valid, errors, spam, feedback } = validateFeedback(body, now());

    if (!valid) {
      res.status(400).json({ error: errors[0] });
      return;
    }

    if (spam) {
      res.status(200).json({ ok: true });
      return;
    }

    try {
      await sendFeedbackEmail(env, feedback);
      res.status(200).json({ ok: true });
    } catch (err) {
      logger.error('Kunne ikke sende feedback-mail', err);
      res.status(500).json({ error: 'Der opstod en fejl. Prøv venligst igen senere.' });
    }
  };
}

module.exports = { createFeedbackHandler, getClientIp };
