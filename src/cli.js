import fs from 'node:fs/promises';
import { scanTarget } from './scanner.js';
import { toJson } from './reporters/json.js';
import { toSarif } from './reporters/sarif.js';
import { toText } from './reporters/text.js';

const HELP = `
ForteZar CyberEye — passive web security scanner

Usage:
  cybereye <url> [options]

Options:
  --format <text|json|sarif>   Output format (default: text)
  --output <file>              Write output to a file
  --timeout <ms>               Request timeout (default: 10000)
  --allow-private              Allow private/loopback targets (off by default)
  --user-agent <value>         Override the default User-Agent
  --help                       Show help
  --version                    Show version

Examples:
  cybereye https://example.com
  cybereye https://example.com --format json
  cybereye https://example.com --format sarif --output cybereye.sarif

CyberEye performs passive checks only. Scan systems you own or are authorized to assess.
`.trim();

function parseArgs(args) {
  const opts = {
    format: 'text',
    timeout: 10_000,
    allowPrivate: false,
    userAgent: 'ForteZar-CyberEye/0.1.0 (+https://github.com/MalsorEQ/fortezar-cybereye)'
  };
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help') opts.help = true;
    else if (arg === '--version') opts.version = true;
    else if (arg === '--allow-private') opts.allowPrivate = true;
    else if (arg === '--format') opts.format = args[++i];
    else if (arg === '--output') opts.output = args[++i];
    else if (arg === '--timeout') opts.timeout = Number(args[++i]);
    else if (arg === '--user-agent') opts.userAgent = args[++i];
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else positional.push(arg);
  }

  if (!['text', 'json', 'sarif'].includes(opts.format)) {
    throw new Error('--format must be text, json, or sarif');
  }
  if (!Number.isFinite(opts.timeout) || opts.timeout < 100 || opts.timeout > 60_000) {
    throw new Error('--timeout must be between 100 and 60000 milliseconds');
  }
  return { target: positional[0], opts };
}

export async function runCli(args) {
  const { target, opts } = parseArgs(args);
  if (opts.help || (!target && !opts.version)) {
    console.log(HELP);
    return;
  }
  if (opts.version) {
    console.log('0.1.0');
    return;
  }

  const report = await scanTarget(target, opts);
  let rendered;
  if (opts.format === 'json') rendered = toJson(report);
  else if (opts.format === 'sarif') rendered = JSON.stringify(toSarif(report), null, 2);
  else rendered = toText(report);

  if (opts.output) {
    await fs.writeFile(opts.output, `${rendered}\n`, 'utf8');
    console.log(`CyberEye report written to ${opts.output}`);
  } else {
    console.log(rendered);
  }

  if (report.summary.high > 0) process.exitCode = 2;
  else if (report.summary.medium > 0) process.exitCode = 1;
}
