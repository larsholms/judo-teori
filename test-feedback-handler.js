const assert = require('assert');
const { createFeedbackHandler } = require('./lib/feedbackHandler');
const { createRateLimiter } = require('./lib/rateLimiter');
const { MIN_SUBMIT_MS } = require('./lib/feedbackValidation');

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(function () { console.log('✓ ' + name); })
    .catch(function (err) {
      console.error('✗ ' + name + '\n  ' + (err && err.stack ? err.stack : err));
      process.exitCode = 1;
    });
}

function fakeRes() {
  return {
    statusCode: null,
    body: null,
    status: function (code) { this.statusCode = code; return this; },
    json: function (payload) { this.body = payload; return this; }
  };
}

function fakeReq(overrides) {
  return Object.assign({
    method: 'POST',
    headers: { 'x-vercel-forwarded-for': '203.0.113.5' },
    socket: { remoteAddress: '127.0.0.1' },
    body: {}
  }, overrides);
}

function validPayload(overrides) {
  return Object.assign({
    belt: '2. kyu (blåt bælte)',
    question: 'Hvad betyder SEOI-NAGE?',
    correctAnswer: 'Skulderkast',
    userAnswer: 'Hoftekast',
    description: 'Svarmuligheden staves forkert.',
    correction: '',
    email: '',
    website: '',
    openedAt: Date.now() - MIN_SUBMIT_MS - 1000
  }, overrides);
}

function buildHandler(overrides) {
  const deps = Object.assign({
    sendFeedbackEmail: async function () { return { provider: 'smtp.dk' }; },
    rateLimiter: createRateLimiter(),
    now: Date.now,
    logger: { error: function () {} },
    env: {}
  }, overrides);
  return createFeedbackHandler(deps);
}

test('afviser andet end POST med 405', async function () {
  const handler = buildHandler();
  const req = fakeReq({ method: 'GET' });
  const res = fakeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 405);
});

test('sender feedback-mail og svarer 200 ved gyldig indsendelse', async function () {
  let sentFeedback = null;
  const handler = buildHandler({
    sendFeedbackEmail: async function (env, feedback) { sentFeedback = feedback; return { provider: 'smtp.dk' }; }
  });
  const req = fakeReq({ body: validPayload() });
  const res = fakeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { ok: true });
  assert.strictEqual(sentFeedback.description, 'Svarmuligheden staves forkert.');
});

test('svarer 400 og sender ingen mail, når beskrivelsen mangler', async function () {
  let mailSent = false;
  const handler = buildHandler({
    sendFeedbackEmail: async function () { mailSent = true; }
  });
  const req = fakeReq({ body: validPayload({ description: '' }) });
  const res = fakeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.error);
  assert.strictEqual(mailSent, false);
});

test('svarer 200 uden at sende mail, når honeypot-feltet er udfyldt (stille spamafvisning)', async function () {
  let mailSent = false;
  const handler = buildHandler({
    sendFeedbackEmail: async function () { mailSent = true; }
  });
  const req = fakeReq({ body: validPayload({ website: 'http://spam.example' }) });
  const res = fakeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(mailSent, false);
});

test('svarer 200 uden at sende mail ved for hurtig indsendelse (stille spamafvisning)', async function () {
  let mailSent = false;
  const handler = buildHandler({
    sendFeedbackEmail: async function () { mailSent = true; }
  });
  const now = Date.now();
  const req = fakeReq({ body: validPayload({ openedAt: now - 100 }) });
  const res = fakeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(mailSent, false);
});

test('svarer 500 med en generisk besked, hvis afsendelse fejler', async function () {
  const handler = buildHandler({
    sendFeedbackEmail: async function () { throw new Error('SMTP-forbindelse fejlede: forkert adgangskode hos smtp.dk'); },
    logger: { error: function () {} }
  });
  const req = fakeReq({ body: validPayload() });
  const res = fakeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.ok(!res.body.error.includes('smtp.dk'), 'fejlbeskeden til klienten må ikke lække interne detaljer');
});

test('rate-limiterer gentagne indsendelser fra samme IP', async function () {
  const rateLimiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
  const handler = buildHandler({ rateLimiter: rateLimiter });
  const ip = '198.51.100.9';

  let lastRes;
  for (let i = 0; i < 4; i++) {
    const req = fakeReq({ headers: { 'x-vercel-forwarded-for': ip }, body: validPayload() });
    lastRes = fakeRes();
    await handler(req, lastRes);
  }
  assert.strictEqual(lastRes.statusCode, 429);
});

test('bruger Vercels betroede IP-header til at adskille rate-limits pr. IP', async function () {
  const rateLimiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
  const handler = buildHandler({ rateLimiter: rateLimiter });

  const resA1 = fakeRes();
  await handler(fakeReq({ headers: { 'x-vercel-forwarded-for': '203.0.113.10' }, body: validPayload() }), resA1);
  assert.strictEqual(resA1.statusCode, 200);

  const resB1 = fakeRes();
  await handler(fakeReq({ headers: { 'x-vercel-forwarded-for': '203.0.113.20' }, body: validPayload() }), resB1);
  assert.strictEqual(resB1.statusCode, 200, 'en anden IP skal ikke være påvirket af den første IPs grænse');
});

test('ignorerer en spoofet x-forwarded-for når Vercels betroede header findes', function () {
  const { getClientIp } = require('./lib/feedbackHandler');
  const ip = getClientIp({
    headers: {
      'x-vercel-forwarded-for': '203.0.113.25',
      'x-forwarded-for': 'attacker-controlled'
    },
    socket: { remoteAddress: '127.0.0.1' }
  });
  assert.strictEqual(ip, '203.0.113.25');
});

test('bruger socket-adressen frem for en ubekræftet x-forwarded-for uden for Vercel', function () {
  const { getClientIp } = require('./lib/feedbackHandler');
  const ip = getClientIp({
    headers: { 'x-forwarded-for': 'attacker-controlled' },
    socket: { remoteAddress: '127.0.0.1' }
  });
  assert.strictEqual(ip, '127.0.0.1');
});

test('rydder udløbne IP-poster fra den lokale forsvarstæller', function () {
  const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });
  limiter.isRateLimited('198.51.100.1', 1000);
  limiter.isRateLimited('198.51.100.2', 1000);
  assert.strictEqual(limiter.entryCount(), 2);
  limiter.isRateLimited('198.51.100.3', 3001);
  assert.strictEqual(limiter.entryCount(), 1);
});
