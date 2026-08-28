const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

const data = fs.readFileSync('data.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8')
  .replace('<script src="data.js"></script>', `<script>${data}</script>`);

const dom = new JSDOM(html, { runScripts: 'dangerously' });
vm.runInContext(axe.source, dom.getInternalVMContext());
const axeOptions = {
  rules: {
    'color-contrast': { enabled: false } // jsdom beregner ikke layout/farver pålideligt
  }
};

function assertNoViolations(results, state) {
  if (results.violations.length) {
    for (const violation of results.violations) {
      console.error(`${state} — ${violation.id}: ${violation.help}`);
    }
    process.exit(1);
  }
}

(async function () {
  assertNoViolations(await dom.window.axe.run(dom.window.document, axeOptions), 'startside');

  const firstBelt = dom.window.document.querySelector('.belt-btn:not(.locked)');
  firstBelt.click();
  const wrongAnswer = [...dom.window.document.querySelectorAll('#answer-buttons button')]
    .find(button => button.dataset.correct === 'false');
  wrongAnswer.click();

  assertNoViolations(await dom.window.axe.run(dom.window.document, axeOptions), 'efter forkert svar');

  // Spil passet færdigt, så resultatsiden vises med en fejloversigt.
  const document_ = dom.window.document;
  const total = document_.getElementById('quiz-progress').max;
  for (let i = 0; i < total; i++) {
    if (i > 0) {
      [...document_.querySelectorAll('#answer-buttons button')]
        .find(button => button.dataset.correct === (i === 1 ? 'false' : 'true')).click();
    }
    document_.getElementById('next-btn').click();
  }
  if (document_.getElementById('result-area').hidden) {
    console.error('resultatsiden blev ikke vist');
    process.exit(1);
  }
  if (!document_.querySelectorAll('#mistake-list li').length) {
    console.error('resultatsiden mangler fejloversigten');
    process.exit(1);
  }
  assertNoViolations(await dom.window.axe.run(document_, axeOptions), 'resultatside med fejloversigt');

  // Et fejlfrit pas viser beskeden om ingen fejl i stedet.
  document_.getElementById('restart-btn').click();
  for (let i = 0; i < total; i++) {
    [...document_.querySelectorAll('#answer-buttons button')]
      .find(button => button.dataset.correct === 'true').click();
    document_.getElementById('next-btn').click();
  }
  if (document_.getElementById('no-mistakes-message').hidden) {
    console.error('beskeden om ingen fejl blev ikke vist');
    process.exit(1);
  }
  assertNoViolations(await dom.window.axe.run(document_, axeOptions), 'resultatside uden fejl');

  console.log('✓ axe: ingen automatiske tilgængelighedsbrud på start, efter svar og på resultatsiden med og uden fejloversigt');
})().catch(err => { console.error(err); process.exit(1); });
