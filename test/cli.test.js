import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('CLI --version matches package.json version', () => {
  const output = execFileSync(process.execPath, ['bin/cybereye.js', '--version'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  }).trim();

  assert.equal(output, packageJson.version);
});
