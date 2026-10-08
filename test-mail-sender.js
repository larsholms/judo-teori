const assert = require('assert');
const { sendFeedbackEmail, buildMessage } = require('./lib/mailSender');

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(function () { console.log('✓ ' + name); })
    .catch(function (err) {
      console.error('✗ ' + name + '\n  ' + (err && err.stack ? err.stack : err));
      process.exitCode = 1;
    });
}

const sampleFeedback = {
  belt: '2. kyu (blåt bælte)',
  question: 'Hvad betyder SEOI-NAGE?',
  correctAnswer: 'Skulderkast',
  userAnswer: 'Hoftekast',
  description: 'Svarmuligheden staves forkert.',
  correction: 'Det burde hedde "Skuldertræk".',
  email: 'bruger@example.com'
};

test('buildMessage indeholder bælte, spørgsmål, svar og beskrivelse', function () {
  const message = buildMessage(sampleFeedback);
  assert.ok(message.includes('Bælte: 2. kyu (blåt bælte)'));
  assert.ok(message.includes('Spørgsmål: Hvad betyder SEOI-NAGE?'));
  assert.ok(message.includes('Korrekt svar ifølge appen: Skulderkast'));
  assert.ok(message.includes('Brugerens valgte svar: Hoftekast'));
  assert.ok(message.includes('Svarmuligheden staves forkert.'));
  assert.ok(message.includes('Kontaktmail: bruger@example.com'));
});

test('buildMessage udelader valgfrie felter, når de er tomme', function () {
  const message = buildMessage(Object.assign({}, sampleFeedback, { userAnswer: null, correction: null, email: null }));
  assert.ok(!message.includes('Brugerens valgte svar'));
  assert.ok(!message.includes('forslag til korrekt svar'));
  assert.ok(message.includes('Ingen kontaktmail angivet'));
});

test('sendFeedbackEmail bruger SMTP.dk, når SMTP-miljøvariabler er sat', async function () {
  let smtpCalledWith = null;
  const env = {
    FEEDBACK_TO_EMAIL: 'lars@example.com',
    SMTP_HOST: 'smtp.smtp.dk',
    SMTP_PORT: '465',
    SMTP_USER: 'feedback@example.com',
    SMTP_PASSWORD: 'hemmelighed',
    SMTP_FROM: 'feedback@example.com',
    RESEND_API_KEY: 'skal-ikke-bruges'
  };

  const result = await sendFeedbackEmail(env, sampleFeedback, {
    smtpSendMail: async function (options) { smtpCalledWith = options; },
    resendSendMail: async function () { throw new Error('Resend burde ikke kaldes, når SMTP er konfigureret'); }
  });

  assert.strictEqual(result.provider, 'smtp.dk');
  assert.strictEqual(smtpCalledWith.host, 'smtp.smtp.dk');
  assert.strictEqual(smtpCalledWith.port, 465);
  assert.strictEqual(smtpCalledWith.to, 'lars@example.com');
  assert.strictEqual(smtpCalledWith.replyTo, 'bruger@example.com');
});

test('sendFeedbackEmail falder tilbage til Resend, når SMTP ikke er konfigureret', async function () {
  let resendCalledWith = null;
  const env = {
    FEEDBACK_TO_EMAIL: 'lars@example.com',
    RESEND_API_KEY: 'test-nøgle',
    RESEND_FROM: 'feedback@judoteori.dk'
  };

  const result = await sendFeedbackEmail(env, sampleFeedback, {
    smtpSendMail: async function () { throw new Error('SMTP burde ikke kaldes uden konfiguration'); },
    resendSendMail: async function (options) { resendCalledWith = options; }
  });

  assert.strictEqual(result.provider, 'resend');
  assert.strictEqual(resendCalledWith.apiKey, 'test-nøgle');
  assert.strictEqual(resendCalledWith.to, 'lars@example.com');
});

test('sendFeedbackEmail falder tilbage til Resend, når SMTP.dk fejler', async function () {
  let resendCalledWith = null;
  const env = {
    FEEDBACK_TO_EMAIL: 'lars@example.com',
    SMTP_HOST: 'smtp.smtp.dk',
    SMTP_USER: 'feedback@example.com',
    SMTP_PASSWORD: 'hemmelighed',
    RESEND_API_KEY: 'test-nøgle',
    RESEND_FROM: 'feedback@judoteori.dk'
  };

  const result = await sendFeedbackEmail(env, sampleFeedback, {
    smtpSendMail: async function () { throw new Error('SMTP er midlertidigt utilgængelig'); },
    resendSendMail: async function (options) { resendCalledWith = options; }
  });

  assert.strictEqual(result.provider, 'resend');
  assert.ok(resendCalledWith, 'Resend skal kaldes efter en SMTP-fejl');
});

test('sendFeedbackEmail kræver RESEND_FROM før Resend bruges', async function () {
  await assert.rejects(
    sendFeedbackEmail({ FEEDBACK_TO_EMAIL: 'lars@example.com', RESEND_API_KEY: 'test-nøgle' }, sampleFeedback, {
      smtpSendMail: async function () {},
      resendSendMail: async function () { throw new Error('må ikke kaldes uden afsender'); }
    }),
    /RESEND_FROM/
  );
});

test('sendFeedbackEmail kaster en fejl, når ingen mailtjeneste er konfigureret', async function () {
  await assert.rejects(sendFeedbackEmail({ FEEDBACK_TO_EMAIL: 'lars@example.com' }, sampleFeedback, {
    smtpSendMail: async function () {},
    resendSendMail: async function () {}
  }));
});

test('sendFeedbackEmail kaster en fejl, når modtageradressen mangler', async function () {
  await assert.rejects(sendFeedbackEmail({}, sampleFeedback, {
    smtpSendMail: async function () {},
    resendSendMail: async function () {}
  }));
});
