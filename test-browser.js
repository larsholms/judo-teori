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

// Gennemfører et helt pas og returnerer de forventede fejl i rækkefølge.
function runPass(labelStart, isWrongAnswer) {
  selectBelt(labelStart);
  const expectedMistakes = [];
  const total = document.getElementById('quiz-progress').max;
  for (let i = 0; i < total; i++) {
    const options = [...document.querySelectorAll('#answer-buttons button')];
    const questionAsked = document.getElementById('question-text').textContent;
    const rightOption = options.find(b => b.dataset.correct === 'true');
    const wrongOption = options.find(b => b.dataset.correct === 'false');
    if (isWrongAnswer(i)) {
      expectedMistakes.push({
        question: questionAsked,
        chosen: wrongOption.dataset.answerText,
        correct: rightOption.dataset.answerText
      });
      wrongOption.click();
    } else {
      rightOption.click();
    }
    document.getElementById('next-btn').click();
  }
  return expectedMistakes;
}

// Resultatsiden viser kun de forkert besvarede spørgsmål med både eget og korrekt svar.
document.querySelector('input[name="training-length"][value="10"]').checked = true;
const mistakes = runPass('5. kyu', i => i % 3 === 0);
assert.strictEqual(document.getElementById('result-area').hidden, false);
const mistakeItems = [...document.querySelectorAll('#mistake-list li')];
assert.strictEqual(mistakeItems.length, mistakes.length, 'fejloversigten skal vise præcis de forkerte svar');
mistakes.forEach((mistake, i) => {
  const text = mistakeItems[i].textContent;
  assert.ok(text.includes(mistake.question), 'fejl ' + (i + 1) + ' mangler spørgsmålet');
  assert.ok(text.includes('Dit svar: ' + mistake.chosen), 'fejl ' + (i + 1) + ' mangler brugerens svar');
  assert.ok(text.includes('Rigtigt svar: ' + mistake.correct), 'fejl ' + (i + 1) + ' mangler det rigtige svar');
});
assert.match(document.querySelector('#mistake-review h3').textContent, /forkert/i);

// Brugeren kan træne kun de spørgsmål, der blev besvaret forkert.
const retryMistakesButton = document.getElementById('retry-mistakes-btn');
assert.ok(retryMistakesButton, 'knappen til målrettet fejltræning skal findes');
assert.strictEqual(retryMistakesButton.hidden, false, 'knappen skal vises, når passet har fejl');
assert.match(retryMistakesButton.textContent, new RegExp(String(mistakes.length)));
const mistakeQuestions = new Set(mistakes.map(mistake => mistake.question));
retryMistakesButton.click();
assert.strictEqual(document.getElementById('quiz-area').hidden, false);
assert.strictEqual(document.getElementById('quiz-progress').max, mistakes.length);
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 0, 'fejloversigten skal ryddes ved målrettet træning');
for (let i = 0; i < mistakes.length; i++) {
  assert.ok(
    mistakeQuestions.has(document.getElementById('question-text').textContent),
    'målrettet træning må kun indeholde spørgsmål fra fejloversigten'
  );
  const rightOption = [...document.querySelectorAll('#answer-buttons button')]
    .find(button => button.dataset.correct === 'true');
  rightOption.click();
  document.getElementById('next-btn').click();
}
assert.strictEqual(document.getElementById('no-mistakes-message').hidden, false);
assert.strictEqual(retryMistakesButton.hidden, true, 'knappen skal skjules efter et fejlfrit pas');

// Et fejlfrit pas viser en kort besked i stedet for fejloversigten.
runPass('4. kyu', () => false);
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 0);
assert.strictEqual(document.getElementById('mistake-review').hidden, true, 'fejloversigten skal skjules uden fejl');
const noMistakes = document.getElementById('no-mistakes-message');
assert.strictEqual(noMistakes.hidden, false, 'ingen-fejl-beskeden skal vises');
assert.match(noMistakes.textContent, /ingen fejl/i);

// Et pas med fejl viser omvendt oversigten og skjuler ingen-fejl-beskeden.
runPass('4. kyu', i => i === 0);
assert.strictEqual(document.getElementById('mistake-review').hidden, false);
assert.strictEqual(noMistakes.hidden, true, 'ingen-fejl-beskeden skal skjules, når der er fejl');

// Fejloversigten nulstilles ved nyt pas, ved stop og ved valg af andet bælte.
runPass('5. kyu', i => i < 2);
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 2);
document.getElementById('restart-btn').click();
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 0, 'nyt pas skal rydde fejloversigten');
assert.strictEqual(document.getElementById('mistake-review').hidden, true);
const abortedWrongAnswer = [...document.querySelectorAll('#answer-buttons button')]
  .find(button => button.dataset.correct === 'false');
assert.ok(abortedWrongAnswer, 'det afbrudte pas skal have et forkert svarvalg');
abortedWrongAnswer.click();
document.getElementById('quit-btn').click();
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 0, 'stop skal rydde fejloversigten');
assert.strictEqual(document.getElementById('mistake-review').hidden, true);
runPass('4. kyu', () => false);
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 0, 'fejl fra et afbrudt pas må ikke følge med til næste pas');
assert.strictEqual(document.getElementById('no-mistakes-message').hidden, false);
document.getElementById('back-btn').click();

runPass('3. kyu', i => i < 3);
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 3);
document.getElementById('back-btn').click();
assert.strictEqual(document.querySelectorAll('#mistake-list li').length, 0, 'andet bælte skal rydde fejloversigten');
assert.strictEqual(document.getElementById('mistake-review').hidden, true);
assert.strictEqual(document.getElementById('no-mistakes-message').hidden, true);

// Fejloversigten flytter ikke fokus og tilføjer ingen ekstra live-region.
runPass('5. kyu', i => i < 2);
assert.strictEqual(document.activeElement.id, 'score-summary', 'fokus skal blive på resultatsammenfatningen');
assert.strictEqual(
  document.getElementById('result-area').getAttribute('aria-live'),
  null,
  'hele fejloversigten må ikke annonceres som én lang live-region; fokus på resultatsammenfatningen giver den korte besked'
);
for (const id of ['mistake-review', 'mistake-list', 'no-mistakes-message']) {
  const element = document.getElementById(id);
  assert.strictEqual(element.getAttribute('aria-live'), null, id + ' må ikke være en ekstra live-region');
  assert.strictEqual(element.getAttribute('role'), null, id + ' må ikke have en ekstra rolle');
  assert.strictEqual(element.getAttribute('tabindex'), null, id + ' må ikke kunne modtage automatisk fokus');
}
assert.strictEqual(document.querySelector('#mistake-review h3').tagName, 'H3');
assert.strictEqual(document.getElementById('mistake-list').tagName, 'UL');

console.log('✓ browseradfærd: træningspas på 10, 20 og 30 spørgsmål, alle fem bælter, feedback og valgfri lyde');
