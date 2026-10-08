'use strict';

const smtpClient = require('./smtpClient');
const resendClient = require('./resendClient');

function buildMessage(feedback) {
  const lines = [
    'Bælte: ' + feedback.belt,
    'Spørgsmål: ' + feedback.question,
    'Korrekt svar ifølge appen: ' + feedback.correctAnswer,
    feedback.userAnswer ? 'Brugerens valgte svar: ' + feedback.userAnswer : null,
    '',
    'Beskrivelse af fejlen:',
    feedback.description,
    feedback.correction ? '\nBrugerens forslag til korrekt svar:\n' + feedback.correction : null,
    feedback.email ? '\nKontaktmail: ' + feedback.email : '\n(Ingen kontaktmail angivet)'
  ].filter(function (line) { return line !== null; });

  return lines.join('\n');
}

async function sendFeedbackEmail(env, feedback, deps) {
  const smtpSendMail = (deps && deps.smtpSendMail) || smtpClient.sendMail;
  const resendSendMail = (deps && deps.resendSendMail) || resendClient.sendMail;

  const to = env.FEEDBACK_TO_EMAIL;
  if (!to) {
    throw new Error('FEEDBACK_TO_EMAIL er ikke konfigureret.');
  }

  const subject = 'Judo-Teori feedback: ' + feedback.belt;
  const text = buildMessage(feedback);
  const replyTo = feedback.email || undefined;

  let smtpError = null;
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
    try {
      await smtpSendMail({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 465,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
        from: env.SMTP_FROM || env.SMTP_USER,
        to: to,
        replyTo: replyTo,
        subject: subject,
        text: text
      });
      return { provider: 'smtp.dk' };
    } catch (error) {
      smtpError = error;
    }
  }

  if (env.RESEND_API_KEY) {
    if (!env.RESEND_FROM) {
      throw new Error('RESEND_FROM mangler');
    }
    await resendSendMail({
      apiKey: env.RESEND_API_KEY,
      from: env.RESEND_FROM,
      to: to,
      replyTo: replyTo,
      subject: subject,
      text: text
    });
    return { provider: 'resend' };
  }

  if (smtpError) throw smtpError;

  throw new Error('Ingen mailtjeneste er konfigureret (hverken SMTP.dk eller Resend).');
}

module.exports = { sendFeedbackEmail, buildMessage };
