import dns from 'node:dns/promises';
import net from 'node:net';

function stripIpv6Brackets(hostname) {
  return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function ipv4InCidr(ip, base, bits) {
  const value = ipv4ToInt(ip);
  const baseValue = ipv4ToInt(base);
  if (value === null || baseValue === null) return false;
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (value & mask) === (baseValue & mask);
}

const NON_PUBLIC_IPV4 = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4]
];

function expandIpv6(ip) {
  let value = stripIpv6Brackets(ip).toLowerCase();
  const zone = value.indexOf('%');
  if (zone !== -1) value = value.slice(0, zone);

  if (value.includes('.')) {
    const lastColon = value.lastIndexOf(':');
    const ipv4 = value.slice(lastColon + 1);
    const int = ipv4ToInt(ipv4);
    if (int === null) return null;
    const high = ((int >>> 16) & 0xffff).toString(16);
    const low = (int & 0xffff).toString(16);
    value = `${value.slice(0, lastColon)}:${high}:${low}`;
  }

  const halves = value.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':').filter(Boolean) : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(':').filter(Boolean) : [];
  const missing = 8 - left.length - right.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;

  const parts = halves.length === 2
    ? [...left, ...Array(missing).fill('0'), ...right]
    : left;
  if (parts.length !== 8 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;

  let out = 0n;
  for (const part of parts) out = (out << 16n) | BigInt(parseInt(part, 16));
  return out;
}

function ipv6InCidr(ip, base, bits) {
  const value = expandIpv6(ip);
  const baseValue = expandIpv6(base);
  if (value === null || baseValue === null) return false;
  if (bits === 0) return true;
  const shift = 128n - BigInt(bits);
  return (value >> shift) === (baseValue >> shift);
}

const NON_PUBLIC_IPV6 = [
  ['::', 128],
  ['::1', 128],
  ['100::', 64],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8]
];

function low32ToIpv4(value) {
  const n = Number(value & 0xffffffffn);
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

export function isPrivateIp(ip) {
  const normalized = stripIpv6Brackets(ip);
  const family = net.isIP(normalized);
  if (family === 4) return NON_PUBLIC_IPV4.some(([base, bits]) => ipv4InCidr(normalized, base, bits));
  if (family === 6) {
    const value = expandIpv6(normalized);
    if (value === null) return false;
    if (ipv6InCidr(normalized, '::ffff:0:0', 96) || ipv6InCidr(normalized, '64:ff9b::', 96)) {
      return isPrivateIp(low32ToIpv4(value));
    }
    return NON_PUBLIC_IPV6.some(([base, bits]) => ipv6InCidr(normalized, base, bits));
  }
  return false;
}

function withTimeout(promise, timeout, message) {
  if (!Number.isFinite(timeout) || timeout <= 0) return promise;
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeout);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

export async function resolveSafeTarget(url, { allowPrivate = false, lookup = dns.lookup, timeout = 10_000 } = {}) {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http:// and https:// targets are supported');
  }
  if (url.username || url.password) {
    throw new Error('Credentials in target URLs are not allowed');
  }

  const hostname = stripIpv6Brackets(url.hostname);
  const literalFamily = net.isIP(hostname);
  if (literalFamily) {
    if (!allowPrivate && isPrivateIp(hostname)) {
      throw new Error('Private, loopback, link-local, reserved, and other non-public targets are blocked by default; use --allow-private only with authorization');
    }
    return { address: hostname, family: literalFamily, hostname };
  }

  const answers = await withTimeout(
    lookup(hostname, { all: true, verbatim: true }),
    timeout,
    `DNS resolution timed out after ${timeout}ms`
  );
  if (!Array.isArray(answers) || answers.length === 0) throw new Error('Target hostname did not resolve');

  if (!allowPrivate && answers.some((entry) => isPrivateIp(entry.address))) {
    throw new Error('Target resolves to a private, loopback, link-local, reserved, or other non-public address; use --allow-private only with authorization');
  }

  const selected = answers[0];
  return { address: selected.address, family: selected.family, hostname };
}

export async function assertSafeTarget(url, options = {}) {
  await resolveSafeTarget(url, options);
}
