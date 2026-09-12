import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { scanTarget } from '../src/scanner.js';
import { toJson } from '../src/reporters/json.js';
import { toSarif } from '../src/reporters/sarif.js';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('JSON and SARIF report versions match package.json', async (t) => {
  let observedUserAgent = null;
  const server = http.createServer((req, res) => {
    observedUserAgent ??= req.headers['user-agent'] ?? null;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html><body>CyberEye regression target</body></html>');
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const target = `http://127.0.0.1:${address.port}`;
  const report = await scanTarget(target, { allowPrivate: true, timeout: 2_000 });

  assert.equal(report.tool.version, pkg.version);

  const json = JSON.parse(toJson(report));
  assert.equal(json.tool.version, pkg.version);

  const sarif = toSarif(report);
  assert.equal(sarif.runs[0].tool.driver.version, pkg.version);

  assert.match(observedUserAgent ?? '', new RegExp(`ForteZar-CyberEye/${pkg.version.replaceAll('.', '\\.')}`));
});
