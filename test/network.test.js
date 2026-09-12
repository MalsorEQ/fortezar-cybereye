import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIp, assertSafeTarget } from '../src/security/network.js';

test('private IPv4 ranges are blocked', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '192.168.1.1', '172.16.0.1', '169.254.1.1']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  assert.equal(isPrivateIp('8.8.8.8'), false);
});

test('unsupported protocols are rejected', async () => {
  await assert.rejects(() => assertSafeTarget(new URL('ftp://example.com')), /Only http/);
});

test('private literal targets require explicit opt-in', async () => {
  await assert.rejects(() => assertSafeTarget(new URL('http://127.0.0.1')), /blocked by default/);
  await assert.doesNotReject(() => assertSafeTarget(new URL('http://127.0.0.1'), { allowPrivate: true }));
});
