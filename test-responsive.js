const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) { console.error('✗ index.html skal have en <style>-blok'); process.exit(1); }
const css = styleMatch[1];

function test(name, fn) {
  try { fn(); console.log('✓ ' + name); }
  catch (err) { console.error('✗ ' + name + '\n  ' + err.message); process.exitCode = 1; }
}

test('mobillayoutet er uændret: body har stadig max-width 640px og den kompakte padding uden for media queries', () => {
  const beforeFirstMedia = css.split('@media')[0];
  assert.match(beforeFirstMedia, /body\s*{[^}]*max-width:\s*640px/, 'body skal stadig have max-width: 640px uden for media queries');
  assert.match(beforeFirstMedia, /body\s*{[^}]*padding:\s*1\.2rem/, 'body skal stadig have den kompakte mobilpadding som standard');
});

test('der findes et bevidst desktop-breakpoint mellem 600px og 1024px', () => {
  const mediaMatches = [...css.matchAll(/@media\s*\(min-width:\s*(\d+)px\)/g)];
  assert.ok(mediaMatches.length >= 1, 'der skal findes mindst én @media (min-width: …) regel til desktop');
  const breakpoint = Number(mediaMatches[0][1]);
  assert.ok(breakpoint >= 600 && breakpoint <= 1024, 'breakpointet (' + breakpoint + 'px) skal være et rimeligt desktop-breakpoint');
});

test('desktoplayoutet udvider bredden moderat uden at strække tekstlinjer for langt', () => {
  assert.ok(css.includes('@media'), 'der skal findes en desktop-media-regel');
  const mediaBlock = css.slice(css.indexOf('@media'));
  const widthMatch = mediaBlock.match(/body\s*{[^}]*max-width:\s*(\d+)px/);
  assert.ok(widthMatch, 'desktop-mediet skal sætte en bredere max-width på body');
  const desktopWidth = Number(widthMatch[1]);
  assert.ok(desktopWidth > 640, 'desktopbredden skal være bredere end mobilbredden (640px)');
  assert.ok(desktopWidth <= 900, 'desktopbredden må ikke strække tekstlinjer for langt (over 900px)');
});

test('paneler får en tydelig, rolig desktopbehandling (kant eller skygge) på desktop', () => {
  assert.ok(css.includes('@media'), 'der skal findes en desktop-media-regel');
  const mediaBlock = css.slice(css.indexOf('@media'));
  const panelBlock = mediaBlock.match(/\.panel\s*{([^}]*)}/);
  assert.ok(panelBlock, 'desktop-mediet skal style .panel');
  assert.ok(/box-shadow|border:/.test(panelBlock[1]), 'panelerne skal have en tydelig kant eller skygge på desktop');
});

test('ingen faste breddeangivelser uden for desktop-mediet kan give vandret overflow ved 320px', () => {
  const beforeFirstMedia = css.split('@media')[0];
  const fixedWidths = [...beforeFirstMedia.matchAll(/(?<![-\w])width:\s*(\d+)px/g)];
  for (const match of fixedWidths) {
    assert.ok(Number(match[1]) <= 320, 'fast bredde ' + match[1] + 'px uden for media queries kan give overflow ved 320px');
  }
});
