import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(path);
  }
  return files;
}

function check(path) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--check', path], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Syntax check failed: ${path}`)));
  });
}

const files = ['./bin/cybereye.js', ...await collect('./src'), ...await collect('./test')];
for (const file of files) await check(file);
console.log(`Syntax OK: ${files.length} JavaScript files`);
