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
  console.log('✓ axe: ingen automatiske tilgængelighedsbrud før eller efter svar');
})().catch(err => { console.error(err); process.exit(1); });
