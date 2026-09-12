# ForteZar CyberEye

[![npm version](https://img.shields.io/npm/v/fortezar-cybereye.svg)](https://www.npmjs.com/package/fortezar-cybereye)
[![npm downloads](https://img.shields.io/npm/dm/fortezar-cybereye.svg)](https://www.npmjs.com/package/fortezar-cybereye)
[![CI](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/ci.yml/badge.svg)](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/ci.yml)
[![CodeQL](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/codeql.yml/badge.svg)](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/MalsorEQ/fortezar-cybereye)](https://github.com/MalsorEQ/fortezar-cybereye/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Node.js >=20](https://img.shields.io/badge/Node.js-%3E%3D20-43853D.svg)](package.json)
[![Zero runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-0-success.svg)](package.json)

**Passive web-security checks for developers and CI — with explainable findings, SARIF output, and safe networking by default.**

ForteZar CyberEye is an open-source web-security scanner designed for defensive use. It inspects externally observable security posture without exploitation, brute force, fuzzing, credential attacks, malware behavior, or stealth/evasion features.

**Passive by default · Explainable findings · CI-ready · Safe networking · Zero runtime dependencies**

## Try it in 10 seconds

No global install required:

```bash
npx fortezar-cybereye@0.1.2 https://example.com
```

Or install the CLI globally:

```bash
npm install -g fortezar-cybereye
cybereye --version
cybereye https://example.com
```

> **Authorization matters:** only assess systems you own or have explicit permission to test. CyberEye blocks private, loopback, link-local, reserved, and other non-public destinations by default.

## Safe local demo

Want to see findings without scanning a public site? CyberEye includes a deterministic localhost-only demo target.

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
npm ci --ignore-scripts
node ./scripts/demo-server.mjs
```

Then, in a second terminal:

```bash
node ./bin/cybereye.js http://127.0.0.1:8787 --allow-private
```

The demo intentionally omits security controls so CyberEye produces real findings such as missing CSP, wildcard CORS, weak cookies, missing `security.txt`, and an insecure form action. See [docs/DEMO.md](docs/DEMO.md).

## What CyberEye checks

CyberEye currently includes 15 passive checks:

| Rule | Severity | Check |
| --- | --- | --- |
| CE001 | High | HTTP final page / HTTPS not enforced |
| CE002 | Medium | HSTS missing |
| CE003 | Medium | CSP missing |
| CE004 | Medium | CSP contains `unsafe-inline` / `unsafe-eval` |
| CE005 | Low | `X-Content-Type-Options` missing or weak |
| CE006 | Low | `Referrer-Policy` missing |
| CE007 | Low | `Permissions-Policy` missing |
| CE008 | Medium | Wildcard CORS |
| CE009 | Low | Server/framework disclosure |
| CE010 | Medium | Cookie missing `Secure` over HTTPS |
| CE011 | Low | Cookie missing `HttpOnly` |
| CE012 | Low | Cookie missing `SameSite` |
| CE013 | Info | `security.txt` missing |
| CE014 | High | Form action posts to HTTP |
| CE015 | Medium | Potential mixed-content HTTP resource |

A clean report does **not** prove a site is secure. CyberEye reports only what it can observe through its documented passive checks.

## CLI usage

```bash
cybereye https://example.com
cybereye https://example.com --format json
cybereye https://example.com --format sarif --output cybereye.sarif
```

For an explicitly authorized internal environment, private destinations require opt-in:

```bash
cybereye https://staging.internal --allow-private
```

### Exit codes

- `0` — no high/medium findings
- `1` — at least one medium finding
- `2` — at least one high finding or execution error

That makes CyberEye usable as a CI quality gate.

## GitHub Action / Marketplace

CyberEye is available as a first-party GitHub Action. Pin workflows to a released version:

```yaml
name: CyberEye

on:
  workflow_dispatch:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: MalsorEQ/fortezar-cybereye@v0.1.2
        with:
          target: https://example.com
          format: sarif
          output: cybereye.sarif
```

For SARIF upload and fuller CI examples, see [docs/GITHUB_ACTION.md](docs/GITHUB_ACTION.md).

## Example output

A deliberately insecure local target can produce output like:

```text
ForteZar CyberEye
HTTP:   200
Score:  22/100
Findings: 2 high, 1 medium, 6 low, 1 info

[HIGH] CE001 — HTTPS is not enforced
[MED ] CE003 — Content Security Policy is missing
[HIGH] CE014 — Insecure form action detected

Passive checks only. A clean report does not prove a site is secure.
```

## Output formats

**Text** is designed for humans and terminal use. **JSON** is intended for automation and integrations. **SARIF 2.1.0** can feed compatible code-scanning workflows:

```bash
cybereye https://example.com --format sarif --output cybereye.sarif
```

## Safe networking

CyberEye treats the network target as untrusted input. For public scans it:

1. accepts only `http://` and `https://` URLs and rejects embedded credentials;
2. resolves the hostname and rejects the target if **any** DNS answer is non-public;
3. pins the validated IP address to the actual socket connection to reduce DNS-rebinding/TOCTOU risk;
4. preserves the original HTTP `Host` header and HTTPS SNI/certificate hostname while connecting to the pinned address;
5. repeats validation and pinning for every redirect;
6. bounds DNS, connection, response-body time, redirect count, and sampled response size.

`--allow-private` intentionally relaxes the address restriction for explicitly authorized internal assessments.

## Security philosophy

CyberEye follows six principles:

1. **Passive by default** — observe before interacting.
2. **Authorization first** — never normalize unauthorized scanning.
3. **Safe networking** — validate and pin destinations before connecting.
4. **Bounded requests** — limit time, redirects, and sampled response data.
5. **Explainable findings** — every rule has evidence and remediation guidance.
6. **No fake certainty** — a clean report does not prove a site is secure.

See [SECURITY.md](SECURITY.md), [DISCLOSURE](DISCLOSURE), and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development

Requires Node.js 20 or newer.

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
npm ci --ignore-scripts
npm run check
npm pack --dry-run
```

CI runs on Node.js 20, 22, and 24, and CodeQL performs static security analysis.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), then check the repository issues for contributor-sized work.

New rules should be passive, reproducible, documented, tested, explainable, and designed for low false-positive risk. Security-sensitive changes receive extra review.

## Roadmap

Planned areas include richer TLS/certificate checks, DNS security checks, a formal rule schema, baseline/suppression files with expiry, plugin APIs, and optional integration with ForteZar Cloud.

See [ROADMAP.md](ROADMAP.md).

## Project boundaries

CyberEye is the standalone open-source developer tool in the broader **ForteZar** ecosystem. Commercial ForteZar services and proprietary systems remain separate from this repository.

## Responsible use

CyberEye is intended for defensive security, secure software development, and authorized assessment. Do not use it to target systems without permission.

## License

Apache License 2.0. See [LICENSE](LICENSE).
