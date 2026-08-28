const fs = require('fs');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const data = fs.readFileSync('data.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<script src="data.js"></script>', `<script>${data}</script>`);

let oscillatorStarts = 0;
class AudioParamStub {
  setValueAtTime() {}
  exponentialRampToValueAtTime() {}
}
class NodeStub {
  constructor() { this.frequency = new AudioParamStub(); this.gain = new AudioParamStub(); }
  connect() { return this; }
  start() { oscillatorStarts++; }
  stop() {}
}
class AudioContextStub {
  constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
  createOscillator() { return new NodeStub(); }
  createGain() { return new NodeStub(); }
  resume() {}
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  beforeParse(window) { window.AudioContext = AudioContextStub; }
});
const document = dom.window.document;

// Starten forklarer forløbet, før brugeren vælger niveau.
assert.strictEqual(document.getElementById('intro-area').hidden, false);
assert.strictEqual(document.getElementById('belt-select').hidden, true);
document.getElementById('start-btn').click();
assert.strictEqual(document.getElementById('intro-area').hidden, true);
assert.strictEqual(document.getElementById('belt-select').hidden, false);
assert.strictEqual(document.activeElement.id, 'belt-heading');

function selectBelt(labelStart) {
  document.getElementById('back-btn').click();
  const button = [...document.querySelectorAll('.belt-btn')].find(b => b.textContent.startsWith(labelStart));
  assert.ok(button, 'Bælteknap mangler: ' + labelStart);
  button.click();
}

// Standardvalget er et kort pas med 10 spørgsmål.
selectBelt('4. kyu');
assert.match(document.getElementById('question-num').textContent, /4\. kyu/);
assert.strictEqual(document.getElementById('quiz-progress').value, 1);
assert.strictEqual(document.getElementById('quiz-progress').max, 10);
assert.match(document.getElementById('question-num').textContent, /af 10/);

// Forkert svar: eksakt korrekt svar annonceres, ikoner og aria-labels sættes, sur lyd spilles.
let buttons = [...document.querySelectorAll('#answer-buttons button')];
let wrong = buttons.find(b => b.dataset.correct === 'false');
let correct = buttons.find(b => b.dataset.correct === 'true');
const correctText = correct.dataset.answerText;
const startsBeforeWrong = oscillatorStarts;
wrong.click();
assert.strictEqual(document.getElementById('feedback').textContent, `Forkert. Det rigtige svar er ${correctText}.`);
assert.ok(wrong.querySelector('.wrong-icon'));
assert.strictEqual(wrong.getAttribute('aria-label'), `Forkert svar: ${wrong.dataset.answerText}`);
assert.ok(correct.querySelector('.correct-icon'));
assert.strictEqual(correct.getAttribute('aria-label'), `Korrekt svar: ${correctText}`);
assert.strictEqual(oscillatorStarts - startsBeforeWrong, 1, 'Forkertlyden skal starte én oscillator');

// Mellempasset har 20 spørgsmål. Korrekt svar giver tretonet pling og korrekt tekst.
document.querySelector('input[name="training-length"][value="20"]').checked = true;
selectBelt('3. kyu');
assert.match(document.getElementById('question-num').textContent, /3\. kyu/);
assert.match(document.getElementById('question-num').textContent, /af 20/);
buttons = [...document.querySelectorAll('#answer-buttons button')];
correct = buttons.find(b => b.dataset.correct === 'true');
const startsBeforeCorrect = oscillatorStarts;
correct.click();
assert.match(document.getElementById('feedback').textContent, /^Rigtigt! Det korrekte svar er /);
assert.ok(correct.querySelector('.correct-icon'));
assert.strictEqual(oscillatorStarts - startsBeforeCorrect, 3, 'Rigtigtlyden skal have tre pling-toner');

// Feedbacklydene kan slås fra; tekst og ikon virker fortsat.
const soundToggle = document.getElementById('sound-toggle');
soundToggle.click();
assert.strictEqual(soundToggle.textContent, 'Lyd: fra');
assert.strictEqual(soundToggle.getAttribute('aria-pressed'), 'true');
selectBelt('5. kyu');
buttons = [...document.querySelectorAll('#answer-buttons button')];
correct = buttons.find(b => b.dataset.correct === 'true');
const startsBeforeMutedAnswer = oscillatorStarts;
correct.click();
assert.match(document.getElementById('feedback').textContent, /^Rigtigt! Det korrekte svar er /);
assert.ok(correct.querySelector('.correct-icon'));
assert.strictEqual(oscillatorStarts, startsBeforeMutedAnswer, 'Ingen lyd må starte, når lyd er slået fra');

// Blåt og brunt er tilgængelige og starter hver sin fulde quiz med 30 spørgsmål.
document.querySelector('input[name="training-length"][value="30"]').checked = true;
for (const label of ['2. kyu', '1. kyu']) {
  selectBelt(label);
  assert.match(document.getElementById('question-num').textContent, new RegExp(label.replace('.', '\\.')));
  assert.match(document.getElementById('question-num').textContent, /af 30/);
}

// Brugeren kan forlade et quizforløb og vende tydeligt tilbage til niveauvalget.
document.getElementById('quit-btn').click();
assert.strictEqual(document.getElementById('quiz-area').hidden, true);
assert.strictEqual(document.getElementById('belt-select').hidden, false);
assert.strictEqual(document.activeElement.id, 'belt-heading');

console.log('✓ browseradfærd: træningspas på 10, 20 og 30 spørgsmål, alle fem bælter, feedback og valgfri lyde');
