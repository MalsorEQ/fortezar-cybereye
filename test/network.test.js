import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIp, assertSafeTarget, resolveSafeTarget } from '../src/security/network.js';

test('non-public IPv4 ranges are blocked', () => {
  for (const ip of [
    '127.0.0.1', '10.0.0.1', '192.168.1.1', '172.16.0.1', '169.254.1.1',
    '100.64.0.1', '198.18.0.1', '192.0.2.10', '198.51.100.10', '203.0.113.10',
    '224.0.0.1', '240.0.0.1'
  ]) assert.equal(isPrivateIp(ip), true, ip);
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('1.1.1.1'), false);
});

test('non-public IPv6 ranges are blocked', () => {
  for (const ip of ['::1', '::', 'fc00::1', 'fd12::1', 'fe80::1', '2001:db8::1', 'ff02::1']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  assert.equal(isPrivateIp('2606:4700:4700::1111'), false);
});

test('unsupported protocols are rejected', async () => {
  await assert.rejects(() => assertSafeTarget(new URL('ftp://example.com')), /Only http/);
});

test('private literal targets require explicit opt-in', async () => {
  await assert.rejects(() => assertSafeTarget(new URL('http://127.0.0.1')), /blocked by default/);
  await assert.doesNotReject(() => assertSafeTarget(new URL('http://127.0.0.1'), { allowPrivate: true }));
});

test('mixed public/private DNS answers are rejected', async () => {
  const lookup = async () => [
    { address: '93.184.216.34', family: 4 },
    { address: '127.0.0.1', family: 4 }
  ];
  await assert.rejects(
    () => resolveSafeTarget(new URL('https://example.test'), { lookup }),
    /resolves to a private/
  );
});

test('resolved public address is returned for pinning', async () => {
  let calls = 0;
  const lookup = async () => {
    calls += 1;
    return [{ address: '93.184.216.34', family: 4 }];
  };
  const resolved = await resolveSafeTarget(new URL('https://example.test/path'), { lookup });
  assert.deepEqual(resolved, { address: '93.184.216.34', family: 4, hostname: 'example.test' });
  assert.equal(calls, 1);
});
