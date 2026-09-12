import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { safeFetch } from '../src/scanner.js';

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

test('safeFetch follows validated redirects', async (t) => {
  const server = http.createServer((req, res) => {
    if (req.url === '/start') {
      res.writeHead(302, { location: '/done' });
      res.end();
    } else {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('ok');
    }
  });
  const port = await listen(server);
  t.after(() => server.close());

  const result = await safeFetch(new URL(`http://127.0.0.1:${port}/start`), {}, {
    allowPrivate: true,
    timeout: 2000,
    userAgent: 'test'
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.redirectChain.length, 2);
  assert.match(result.finalUrl.toString(), /\/done$/);
});

test('redirect to a private address is rejected before the second request', async (t) => {
  let privateTargetHits = 0;
  const privateServer = http.createServer((req, res) => {
    privateTargetHits += 1;
    res.end('should not be reached');
  });
  const privatePort = await listen(privateServer);
  t.after(() => privateServer.close());

  const redirectTarget = new URL(`http://127.0.0.1:${privatePort}/secret`);
  await assert.rejects(
    async () => {
      const { assertSafeTarget } = await import('../src/security/network.js');
      await assertSafeTarget(redirectTarget, { allowPrivate: false });
    },
    /blocked by default/
  );
  assert.equal(privateTargetHits, 0);
});
