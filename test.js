const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const dataSource = fs.readFileSync('data.js', 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(dataSource.replace('const QUIZ_DATA', 'this.QUIZ_DATA'), context);
const data = context.QUIZ_DATA;
const html = fs.readFileSync('index.html', 'utf8');

function test(name, fn) {
  try { fn(); console.log('✓ ' + name); }
  catch (err) { console.error('✗ ' + name + '\n  ' + err.message); process.exitCode = 1; }
}

test('orange, grønt, blåt og brunt bælte er låst op med 30 spørgsmål hver', () => {
  for (const key of ['4kyu', '3kyu', '2kyu', '1kyu']) {
    assert.notStrictEqual(data[key].locked, true, key + ' er stadig låst');
    assert.ok(Array.isArray(data[key].questions), key + ' mangler spørgsmål');
    assert.strictEqual(data[key].questions.length, 30, key + ' har ikke 30 spørgsmål');
  }
});

test('blåt og brunt bælte har sporbar kilde til det officielle pensum', () => {
  assert.strictEqual(data['2kyu'].sourcePages, '9-10');
  assert.strictEqual(data['1kyu'].sourcePages, '11');
});

test('nye spørgsmål bruger pensummets præcise formulering ved mulige ordlistekonflikter', () => {
  const blueSeoi = data['2kyu'].questions.find(q => q.q === 'Hvordan oversættes SEOI-NAGE (ERI) i pensummet?');
  assert.ok(blueSeoi, 'præciseret SEOI-NAGE (ERI)-spørgsmål mangler');
  assert.strictEqual(blueSeoi.options[blueSeoi.answer], 'Skulderkast (revers)');
  assert.ok(data['2kyu'].questions.some(q => q.q === 'Hvad betyder SUKUI-NAGE?'));
  assert.ok(data['1kyu'].questions.some(q => q.q === 'Hvordan oversættes TOMOE-NAGE på pensumsiden for 1. kyu?'));
  assert.ok(data['1kyu'].questions.some(q => q.q === 'Hvordan oversættes YOKO-TOMOE-NAGE på pensumsiden for 1. kyu?'));
  assert.ok(data['1kyu'].questions.some(q => q.q === "Hvilket ordled i SOTO-MAKIKOMI betyder 'rulle' ifølge ordlisten?"));
  for (const entry of [
    ['Hvad betyder GURUMA?', 'Hjul'],
    ['Hvad betyder TOMOE ifølge ordlisten?', 'Bue'],
    ['Hvad betyder KOMI?', 'Indad']
  ]) {
    const question = data['1kyu'].questions.find(q => q.q === entry[0]);
    assert.ok(question, entry[0] + ' mangler');
    assert.strictEqual(question.options[question.answer], entry[1]);
  }
});

test('ippon-spørgsmålet forklarer både betydning og kampafgørelse', () => {
  const question = data['3kyu'].questions.find(q => q.q.startsWith('Hvad betyder IPPON,'));
  assert.ok(question, 'Det uddybede IPPON-spørgsmål mangler');
  assert.strictEqual(question.q, 'Hvad betyder IPPON, og hvilken betydning har det i en judokamp?');
  assert.strictEqual(
    question.options[question.answer],
    'IPPON betyder ét fuldt point. Det er den højeste score i judo og giver straks sejr, så kampen afsluttes.'
  );
});

test('alle spørgsmål har fire unikke svar og gyldigt korrekt svar', () => {
  for (const [belt, level] of Object.entries(data)) {
    if (!level.questions) continue;
    assert.strictEqual(new Set(level.questions.map(q => q.q)).size, level.questions.length, `${belt}: spørgsmål skal være unikke`);
    for (const [i, q] of level.questions.entries()) {
      assert.strictEqual(q.options.length, 4, `${belt} spørgsmål ${i + 1}`);
      assert.strictEqual(new Set(q.options).size, 4, `${belt} spørgsmål ${i + 1} har dubletter`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${belt} spørgsmål ${i + 1}`);
    }
  }
});

test('appen oplyser målgruppe, kilde og uafhængig status', () => {
  assert.match(html, /børn og unge \(6-14 år\)/i);
  assert.match(html, /https:\/\/www\.judo\.dk\/for-klubberne\/pensum/);
  assert.match(html, /Gradueringspensum børn og ungdom 6-14 år/);
  assert.match(html, /opdateret februar 2024/);
  assert.match(html, /uafhængigt træningsværktøj/i);
});

test('repoet dokumenterer vedligeholdelse og udgivelse af spørgsmål', () => {
  const readme = fs.readFileSync('README.md', 'utf8');
  assert.match(readme, /Opdatering af spørgsmål/);
  assert.match(readme, /npm test/);
  assert.match(readme, /sourcePages/);
  assert.match(readme, /Judo Danmark/);
});

test('appen har en restriktiv sikkerhedspolitik og referrer-politik', () => {
  assert.match(html, /http-equiv="Content-Security-Policy"/i);
  assert.match(html, /default-src 'self'/i);
  assert.match(html, /object-src 'none'/i);
  assert.match(html, /base-uri 'none'/i);
  assert.match(html, /connect-src 'none'/i);
  assert.match(html, /name="referrer" content="strict-origin-when-cross-origin"/i);

  const privacyHtml = fs.readFileSync('privatliv.html', 'utf8');
  assert.match(privacyHtml, /http-equiv="Content-Security-Policy"/i);
  assert.match(privacyHtml, /script-src 'none'/i);
  assert.match(privacyHtml, /name="referrer" content="strict-origin-when-cross-origin"/i);
});

test('forkert svar annoncerer selve det korrekte svar for skærmlæser', () => {
  assert.ok(html.includes('feedback.textContent = "Forkert. Det rigtige svar er " + correctAnswer + "."'));
  assert.match(html, /role="status" aria-live="assertive"/);
});

test('korrekt svar får både synligt ikon og tekstlig tilgængelig markering', () => {
  assert.match(html, /correct-icon/);
  assert.match(html, /addAnswerIcon\([^\n]*"Korrekt svar"\)/);
});

test('forkert svar får synligt ikon og tekstlig tilgængelig markering', () => {
  assert.match(html, /wrong-icon/);
  assert.match(html, /addAnswerIcon\([^\n]*"Forkert svar"\)/);
});

test('Web Audio bruges til særskilte rigtigt- og forkertlyde', () => {
  assert.match(html, /function playCorrectSound/);
  assert.match(html, /function playWrongSound/);
  assert.match(html, /AudioContext/);
});

test('brugeren kan slå feedbacklyde fra uden at miste den visuelle feedback', () => {
  assert.match(html, /id="sound-toggle"[^>]*aria-pressed="false"/);
  assert.match(html, /soundEnabled = !soundEnabled/);
  assert.match(html, /if \(!soundEnabled\) return/);
});

test('feedbackfarver har mindst WCAG AA-kontrast mod panelet', () => {
  function luminance(hex) {
    const rgb = hex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16) / 255);
    const linear = rgb.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }
  function contrast(a, b) {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (values[0] + 0.05) / (values[1] + 0.05);
  }
  const panel = html.match(/--panel:\s*(#[0-9a-f]{6})/i)[1];
  for (const variable of ['correct', 'wrong']) {
    const color = html.match(new RegExp(`--${variable}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
    assert.ok(contrast(color, panel) >= 4.5, `${variable} har for lav kontrast`);
  }
});
