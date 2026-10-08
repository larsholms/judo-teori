const assert = require('assert');
const { validateFeedback, MIN_SUBMIT_MS, LIMITS } = require('./lib/feedbackValidation');

function test(name, fn) {
  try { fn(); console.log('✓ ' + name); }
  catch (err) { console.error('✗ ' + name + '\n  ' + err.message); process.exitCode = 1; }
}

function validBody(overrides) {
  return Object.assign({
    belt: '2. kyu (blåt bælte)',
    question: 'Hvad betyder SEOI-NAGE?',
    correctAnswer: 'Skulderkast',
    userAnswer: 'Hoftekast',
    description: 'Svarmuligheden staves forkert.',
    correction: 'Det burde hedde "Skuldertræk".',
    email: '',
    website: '',
    openedAt: Date.now() - MIN_SUBMIT_MS - 1000
  }, overrides);
}

test('gyldig indsendelse godkendes og returnerer beskåret feedback', () => {
  const result = validateFeedback(validBody({ description: '  Svaret er forkert.  ' }), Date.now());
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.spam, false);
  assert.strictEqual(result.feedback.description, 'Svaret er forkert.');
});

test('afviser indsendelse uden beskrivelse', () => {
  const result = validateFeedback(validBody({ description: '   ' }), Date.now());
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('afviser indsendelse uden bælteniveau', () => {
  const result = validateFeedback(validBody({ belt: '' }), Date.now());
  assert.strictEqual(result.valid, false);
});

test('afviser for lang beskrivelse', () => {
  const result = validateFeedback(validBody({ description: 'x'.repeat(LIMITS.description + 1) }), Date.now());
  assert.strictEqual(result.valid, false);
});

test('afviser ugyldig e-mailadresse, men tillader tom e-mail', () => {
  const invalid = validateFeedback(validBody({ email: 'ikke-en-mail' }), Date.now());
  assert.strictEqual(invalid.valid, false);

  const empty = validateFeedback(validBody({ email: '' }), Date.now());
  assert.strictEqual(empty.valid, true);
});

test('afviser manglende eller fremtidig openedAt som ugyldigt', () => {
  const missing = validateFeedback(validBody({ openedAt: undefined }), Date.now());
  assert.strictEqual(missing.valid, false);

  const future = validateFeedback(validBody({ openedAt: Date.now() + 60000 }), Date.now());
  assert.strictEqual(future.valid, false);
});

test('markerer udfyldt honeypot-felt som spam uden at afvise som ugyldig', () => {
  const result = validateFeedback(validBody({ website: 'http://spam.example' }), Date.now());
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.spam, true);
});

test('markerer for hurtig indsendelse som spam', () => {
  const now = Date.now();
  const result = validateFeedback(validBody({ openedAt: now - 500 }), now);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.spam, true);
});

test('gyldig indsendelse efter minimumstiden er ikke spam', () => {
  const now = Date.now();
  const result = validateFeedback(validBody({ openedAt: now - MIN_SUBMIT_MS - 1 }), now);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.spam, false);
});

test('valgfrie felter er null, når de ikke udfyldes', () => {
  const result = validateFeedback(validBody({ userAnswer: '', correction: '', email: '' }), Date.now());
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.feedback.userAnswer, null);
  assert.strictEqual(result.feedback.correction, null);
  assert.strictEqual(result.feedback.email, null);
});
