import { assertSafeTarget } from './security/network.js';
import { evaluateRules } from './rules/index.js';

function normalizeHeaders(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) out[key.toLowerCase()] = value;
  return out;
}

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  const raw = headers.get('set-cookie');
  return raw ? [raw] : [];
}

async function fetchOnce(url, options, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'manual' });
  } finally {
    clearTimeout(timer);
  }
}

export async function safeFetch(url, options, opts, maxRedirects = 5) {
  let current = new URL(url);
  const chain = [];

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    await assertSafeTarget(current, opts);
    const response = await fetchOnce(current, options, opts.timeout);
    chain.push({ url: current.toString(), status: response.status });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, finalUrl: current, redirectChain: chain };
    }

    const location = response.headers.get('location');
    if (!location) return { response, finalUrl: current, redirectChain: chain };
    if (hop === maxRedirects) throw new Error(`Too many redirects (>${maxRedirects})`);

    const next = new URL(location, current);
    await assertSafeTarget(next, opts);
    try { await response.body?.cancel(); } catch { /* best effort */ }
    current = next;
  }

  throw new Error('Redirect handling failed');
}

async function inspectSecurityTxt(baseUrl, opts) {
  const u = new URL('/.well-known/security.txt', baseUrl);
  try {
    const { response } = await safeFetch(u, { headers: { 'user-agent': opts.userAgent } }, opts, 3);
    const contentType = response.headers.get('content-type') ?? '';
    const text = response.ok ? (await response.text()).slice(0, 16_384) : '';
    return { present: response.ok && /contact:/i.test(text), status: response.status, contentType };
  } catch {
    return { present: false, status: null, contentType: null };
  }
}

export async function scanTarget(target, options = {}) {
  const opts = {
    timeout: 10_000,
    allowPrivate: false,
    userAgent: 'ForteZar-CyberEye/0.1.0',
    ...options
  };

  let url;
  try {
    url = new URL(target);
  } catch {
    throw new Error('Target must be a complete URL, for example https://example.com');
  }

  const startedAt = new Date();
  const { response, finalUrl, redirectChain } = await safeFetch(url, {
    method: 'GET',
    headers: {
      'user-agent': opts.userAgent,
      'accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1'
    }
  }, opts);

  const contentLength = Number(response.headers.get('content-length') ?? '0');
  let htmlSample = '';
  const contentType = response.headers.get('content-type') ?? '';
  if ((!contentLength || contentLength <= 2_000_000) && /text\/html|application\/xhtml\+xml/i.test(contentType)) {
    htmlSample = (await response.text()).slice(0, 512_000);
  }

  const observation = {
    target: url.toString(),
    finalUrl: finalUrl.toString(),
    status: response.status,
    headers: normalizeHeaders(response.headers),
    setCookies: getSetCookies(response.headers),
    securityTxt: await inspectSecurityTxt(finalUrl, opts),
    htmlSample
  };

  const findings = evaluateRules(observation);
  const summary = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, { high: 0, medium: 0, low: 0, info: 0 });

  const score = Math.max(0, 100 - (summary.high * 25 + summary.medium * 10 + summary.low * 3));
  return {
    schemaVersion: '1.0',
    tool: { name: 'ForteZar CyberEye', version: '0.1.0' },
    target: observation.target,
    finalUrl: observation.finalUrl,
    redirectChain,
    scannedAt: startedAt.toISOString(),
    status: response.status,
    score,
    summary,
    findings
  };
}
