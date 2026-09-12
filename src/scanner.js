import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { resolveSafeTarget } from './security/network.js';
import { evaluateRules } from './rules/index.js';

function normalizeHeaders(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) out[key.toLowerCase()] = value;
  return out;
}

function createHeaders(rawHeaders) {
  const values = new Map();
  const setCookies = [];
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const key = String(rawHeaders[i] ?? '').toLowerCase();
    const value = String(rawHeaders[i + 1] ?? '');
    if (key === 'set-cookie') setCookies.push(value);
    const previous = values.get(key);
    values.set(key, previous ? `${previous}, ${value}` : value);
  }
  return {
    get(name) { return values.get(String(name).toLowerCase()) ?? null; },
    getSetCookie() { return [...setCookies]; },
    entries() { return values.entries(); }
  };
}

function readTextBounded(stream, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let settled = false;

    const cleanup = () => {
      stream.off('data', onData);
      stream.off('end', onEnd);
      stream.off('error', onError);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(Buffer.concat(chunks).toString('utf8'));
    };
    const onData = (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const remaining = maxBytes - total;
      if (remaining <= 0) {
        stream.destroy();
        finish();
        return;
      }
      if (buffer.length > remaining) {
        chunks.push(buffer.subarray(0, remaining));
        total += remaining;
        stream.destroy();
        finish();
        return;
      }
      chunks.push(buffer);
      total += buffer.length;
    };
    const onEnd = finish;
    const onError = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onError);
  });
}

async function requestPinned(url, options, opts) {
  const resolved = await resolveSafeTarget(url, opts);
  const transport = url.protocol === 'https:' ? https : http;
  const originalHostname = resolved.hostname;
  const headers = { ...(options.headers ?? {}) };
  if (!Object.keys(headers).some((key) => key.toLowerCase() === 'host')) headers.host = url.host;

  return new Promise((resolve, reject) => {
    const request = transport.request({
      protocol: url.protocol,
      hostname: resolved.address,
      family: resolved.family,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: options.method ?? 'GET',
      headers,
      servername: url.protocol === 'https:' && net.isIP(originalHostname) === 0 ? originalHostname : undefined
    }, (res) => {
      res.setTimeout(opts.timeout, () => res.destroy(new Error(`Response body timed out after ${opts.timeout}ms`)));
      const responseHeaders = createHeaders(res.rawHeaders);
      resolve({
        status: res.statusCode ?? 0,
        ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
        headers: responseHeaders,
        body: { cancel: async () => res.destroy() },
        text: (maxBytes = 512_000) => readTextBounded(res, maxBytes)
      });
    });

    const timer = setTimeout(() => request.destroy(new Error(`Request timed out after ${opts.timeout}ms`)), opts.timeout);
    request.on('response', () => clearTimeout(timer));
    request.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    request.end(options.body);
  });
}

export async function safeFetch(url, options, opts, maxRedirects = 5) {
  let current = new URL(url);
  const chain = [];

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    // resolveSafeTarget() is called inside requestPinned(), and the exact validated
    // address is then used for the socket. This prevents a second DNS lookup from
    // changing the destination between validation and connection (DNS rebinding).
    const response = await requestPinned(current, options, opts);
    chain.push({ url: current.toString(), status: response.status });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, finalUrl: current, redirectChain: chain };
    }

    const location = response.headers.get('location');
    if (!location) return { response, finalUrl: current, redirectChain: chain };
    if (hop === maxRedirects) throw new Error(`Too many redirects (>${maxRedirects})`);

    const next = new URL(location, current);
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
    const text = response.ok ? await response.text(16_384) : '';
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
    htmlSample = await response.text(512_000);
  } else {
    try { await response.body?.cancel(); } catch { /* best effort */ }
  }

  const observation = {
    target: url.toString(),
    finalUrl: finalUrl.toString(),
    status: response.status,
    headers: normalizeHeaders(response.headers),
    setCookies: response.headers.getSetCookie(),
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
