import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { safeFetch } from '../src/scanner.js';
import { resolveSafeTarget } from '../src/security/network.js';

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

test('validated DNS answer is pinned to the actual socket connection', async (t) => {
  const server = http.createServer((req, res) => {
    assert.equal(req.headers.host, `rebind.test:${server.address().port}`);
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('pinned');
  });
  const port = await listen(server);
  t.after(() => server.close());

  let lookupCalls = 0;
  const result = await safeFetch(new URL(`http://rebind.test:${port}/`), {}, {
    allowPrivate: true,
    timeout: 2000,
    userAgent: 'test',
    lookup: async () => {
      lookupCalls += 1;
      return [{ address: '127.0.0.1', family: 4 }];
    }
  });

  assert.equal(result.response.status, 200);
  assert.equal(await result.response.text(64), 'pinned');
  assert.equal(lookupCalls, 1, 'the network layer must not perform a second DNS lookup');
});

test('redirect destinations resolving to private addresses are rejected', async () => {
  const lookup = async () => [{ address: '127.0.0.1', family: 4 }];
  await assert.rejects(
    () => resolveSafeTarget(new URL('http://redirect-target.test/private'), { lookup }),
    /resolves to a private/
  );
});
