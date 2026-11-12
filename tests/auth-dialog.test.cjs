const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('login dialog has no WeChat option and explains email rate limits', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'reading', 'AuthDialog.tsx'), 'utf8');
  assert.doesNotMatch(source, /微信|wechat/i);
  assert.match(source, /over_email_send_rate_limit/);
  assert.match(source, /over_request_rate_limit/);
  assert.match(source, /emailRetrySeconds > 0/);
});
