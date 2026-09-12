import dns from 'node:dns/promises';
import net from 'node:net';

function isPrivateIPv4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  return p[0] === 10 ||
    p[0] === 127 ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    p[0] === 0;
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  return normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:');
}

export function isPrivateIp(ip) {
  const family = net.isIP(ip);
  return family === 4 ? isPrivateIPv4(ip) : family === 6 ? isPrivateIPv6(ip) : false;
}

export async function assertSafeTarget(url, { allowPrivate = false } = {}) {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http:// and https:// targets are supported');
  }
  if (url.username || url.password) {
    throw new Error('Credentials in target URLs are not allowed');
  }
  if (allowPrivate) return;

  if (net.isIP(url.hostname)) {
    if (isPrivateIp(url.hostname)) throw new Error('Private/loopback targets are blocked by default; use --allow-private only with authorization');
    return;
  }

  const answers = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (answers.length === 0) throw new Error('Target hostname did not resolve');
  if (answers.some((entry) => isPrivateIp(entry.address))) {
    throw new Error('Target resolves to a private/loopback address; use --allow-private only with authorization');
  }
}
