const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('SPA rewrites cover browser pages without swallowing API functions', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const sources = config.rewrites.map((rewrite) => rewrite.source);
  assert.deepEqual(sources, ['/draw', '/recommendation', '/spread/:id']);
  assert.ok(config.rewrites.every((rewrite) => rewrite.destination === '/index.html'));
  assert.ok(sources.every((source) => !source.startsWith('/api') && source !== '/(.*)'));
  for (const name of ['interpret', 'private-interpret', 'recommend-spread']) {
    assert.ok(fs.existsSync(path.join(root, 'api', `${name}.ts`)));
  }
});

test('question flow pauses on recommendation before entering the clean draw room', () => {
  const app = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
  const desktop = fs.readFileSync(path.join(root, 'src', 'desktop', 'DesktopReadingRoom.tsx'), 'utf8');
  const mobile = fs.readFileSync(path.join(root, 'src', 'components', 'ReadingRoom.tsx'), 'utf8');
  assert.match(app, /navigate\('\/recommendation'\)/);
  assert.match(app, /pathname === '\/recommendation'/);
  assert.doesNotMatch(desktop, /desktop-reading-context/);
  assert.doesNotMatch(mobile, /reading-context/);
});
