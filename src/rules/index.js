function finding(id, title, severity, message, remediation, evidence = {}) {
  return { id, title, severity, message, remediation, evidence };
}

function header(headers, name) {
  return headers[name.toLowerCase()] ?? null;
}

export function evaluateRules(observation) {
  const findings = [];
  const { finalUrl, headers, setCookies, securityTxt, htmlSample } = observation;
  const url = new URL(finalUrl);

  if (url.protocol !== 'https:') {
    findings.push(finding('CE001', 'HTTPS is not enforced', 'high', 'The final page is served over HTTP.', 'Serve the site exclusively over HTTPS and redirect HTTP to HTTPS.', { finalUrl }));
  }

  if (url.protocol === 'https:' && !header(headers, 'strict-transport-security')) {
    findings.push(finding('CE002', 'HSTS header is missing', 'medium', 'HTTPS is enabled but Strict-Transport-Security is not present.', 'Add an HSTS policy after confirming all required subdomains support HTTPS.'));
  }

  const csp = header(headers, 'content-security-policy');
  if (!csp) {
    findings.push(finding('CE003', 'Content Security Policy is missing', 'medium', 'No Content-Security-Policy response header was observed.', 'Deploy a restrictive CSP and tune it using report-only mode before enforcement.'));
  } else if (/unsafe-inline|unsafe-eval/i.test(csp)) {
    findings.push(finding('CE004', 'CSP contains risky directives', 'medium', 'The CSP allows unsafe-inline and/or unsafe-eval.', 'Prefer nonces/hashes and remove unsafe directives where feasible.', { csp }));
  }

  if ((header(headers, 'x-content-type-options') ?? '').toLowerCase() !== 'nosniff') {
    findings.push(finding('CE005', 'X-Content-Type-Options is missing or weak', 'low', 'The nosniff directive was not observed.', 'Set X-Content-Type-Options: nosniff.'));
  }

  if (!header(headers, 'referrer-policy')) {
    findings.push(finding('CE006', 'Referrer-Policy is missing', 'low', 'No Referrer-Policy response header was observed.', 'Set a deliberate policy such as strict-origin-when-cross-origin.'));
  }

  if (!header(headers, 'permissions-policy')) {
    findings.push(finding('CE007', 'Permissions-Policy is missing', 'low', 'No Permissions-Policy response header was observed.', 'Disable unnecessary browser capabilities with a restrictive Permissions-Policy.'));
  }

  const acao = header(headers, 'access-control-allow-origin');
  if (acao === '*') {
    findings.push(finding('CE008', 'CORS allows any origin', 'medium', 'Access-Control-Allow-Origin is set to *.', 'Restrict CORS to trusted origins when cross-origin access is required.', { acao }));
  }

  const server = header(headers, 'server');
  const powered = header(headers, 'x-powered-by');
  if (server || powered) {
    findings.push(finding('CE009', 'Technology details are disclosed', 'low', 'Server/framework headers reveal implementation details.', 'Remove unnecessary version/framework disclosure headers.', { server, poweredBy: powered }));
  }

  for (const cookie of setCookies) {
    const lower = cookie.toLowerCase();
    const name = cookie.split('=', 1)[0] || '(unnamed)';
    if (url.protocol === 'https:' && !lower.includes('; secure')) {
      findings.push(finding('CE010', `Cookie ${name} is missing Secure`, 'medium', 'A cookie was set over HTTPS without the Secure attribute.', 'Mark security-sensitive cookies Secure.', { cookieName: name }));
    }
    if (!lower.includes('; httponly')) {
      findings.push(finding('CE011', `Cookie ${name} is missing HttpOnly`, 'low', 'A cookie was set without HttpOnly.', 'Use HttpOnly for cookies that do not require JavaScript access.', { cookieName: name }));
    }
    if (!lower.includes('; samesite=')) {
      findings.push(finding('CE012', `Cookie ${name} is missing SameSite`, 'low', 'A cookie was set without an explicit SameSite policy.', 'Set SameSite=Lax or Strict where compatible, or None; Secure when cross-site use is required.', { cookieName: name }));
    }
  }

  if (!securityTxt.present) {
    findings.push(finding('CE013', 'security.txt was not found', 'info', 'No /.well-known/security.txt file was found.', 'Publish a security.txt file with a monitored security contact and expiry date.'));
  }

  if (/\baction\s*=\s*["']http:\/\//i.test(htmlSample)) {
    findings.push(finding('CE014', 'Insecure form action detected', 'high', 'The sampled HTML contains a form posting to HTTP.', 'Submit forms only to HTTPS endpoints.'));
  }

  if (/\b(?:src|href)\s*=\s*["']http:\/\//i.test(htmlSample) && url.protocol === 'https:') {
    findings.push(finding('CE015', 'Potential mixed-content reference detected', 'medium', 'The sampled HTTPS page references an HTTP resource.', 'Load active and passive resources over HTTPS.'));
  }

  return findings;
}
