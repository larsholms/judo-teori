'use strict';

async function sendMail(options) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + options.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: options.from,
      to: [options.to],
      reply_to: options.replyTo || undefined,
      subject: options.subject,
      text: options.text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(function () { return ''; });
    throw new Error('Resend-fejl (' + response.status + '): ' + detail.slice(0, 200));
  }
}

module.exports = { sendMail };
