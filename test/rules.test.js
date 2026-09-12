import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRules } from '../src/rules/index.js';

function base(overrides = {}) {
  return {
    finalUrl: 'https://example.com/',
    headers: {
      'strict-transport-security': 'max-age=31536000',
      'content-security-policy': "default-src 'self'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=()'
    },
    setCookies: [],
    securityTxt: { present: true },
    htmlSample: '',
    ...overrides
  };
}

test('secure baseline has no findings', () => {
  assert.deepEqual(evaluateRules(base()), []);
});

test('missing core headers produce findings', () => {
  const findings = evaluateRules(base({ headers: {} }));
  const ids = findings.map((f) => f.id);
  assert.ok(ids.includes('CE002'));
  assert.ok(ids.includes('CE003'));
  assert.ok(ids.includes('CE005'));
});

test('wildcard CORS is reported', () => {
  const observation = base();
  observation.headers['access-control-allow-origin'] = '*';
  assert.ok(evaluateRules(observation).some((f) => f.id === 'CE008'));
});

test('cookie attributes are evaluated', () => {
  const findings = evaluateRules(base({ setCookies: ['session=abc; Path=/'] }));
  const ids = findings.map((f) => f.id);
  assert.ok(ids.includes('CE010'));
  assert.ok(ids.includes('CE011'));
  assert.ok(ids.includes('CE012'));
});
