# ForteZar CyberEye

[![CI](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/ci.yml/badge.svg)](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/ci.yml)
[![CodeQL](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/codeql.yml/badge.svg)](https://github.com/MalsorEQ/fortezar-cybereye/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/MalsorEQ/fortezar-cybereye)](https://github.com/MalsorEQ/fortezar-cybereye/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Node.js >=20](https://img.shields.io/badge/Node.js-%3E%3D20-43853D.svg)](package.json)
[![Zero runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-0-success.svg)](package.json)

**See web-security weaknesses before they reach production.**

ForteZar CyberEye is an open-source, passive-first web security scanner for developers, CI pipelines, and defensive security teams. It inspects externally observable security posture without exploitation and produces explainable findings in text, JSON, or SARIF.

**Passive by default · Explainable findings · CI-ready · Safe networking**

## Quick start

```bash
npm install -g fortezar-cybereye
cybereye https://example.com
```

Or use the repository directly:

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
npm ci
node ./bin/cybereye.js https://example.com
```

> **Authorization matters:** only assess systems you own or have explicit permission to test. CyberEye blocks private, loopback, link-local, reserved, and other non-public destinations by default.

## Why CyberEye

Security checks should be easy to run before production. CyberEye focuses on a compact set of high-signal checks with transparent evidence and remediation guidance rather than opaque claims of complete security.

CyberEye is the standalone open-source developer tool in the broader **ForteZar** ecosystem. The commercial ForteZar platform remains separate and private.

## What v0.1.0 checks

CyberEye currently identifies 15 classes of observable issues, including:

- HTTP instead of HTTPS
- missing HSTS
- missing or risky Content Security Policy
- missing `X-Content-Type-Options`
- missing `Referrer-Policy`
- missing `Permissions-Policy`
- wildcard CORS
- unnecessary server/framework disclosure
- cookies missing `Secure`, `HttpOnly`, or `SameSite`
- missing `/.well-known/security.txt`
- obvious HTTP form actions
- potential mixed-content references

The first release intentionally avoids brute force, exploitation, fuzzing, credential attacks, destructive requests, malware behavior, and stealth/evasion features.

## Install

Requires Node.js 20 or newer.

```bash
npm install -g fortezar-cybereye
```

During development, run directly from the repository:

```bash
npm ci
node ./bin/cybereye.js https://example.com
```

## Usage

```bash
cybereye https://example.com
cybereye https://example.com --format json
cybereye https://example.com --format sarif --output cybereye.sarif
```

For an authorized internal environment, private destinations require explicit opt-in:

```bash
cybereye https://staging.internal --allow-private
```

## Safe networking

CyberEye treats the network target as untrusted input. For public scans it:

1. accepts only `http://` and `https://` URLs and rejects embedded credentials;
2. resolves the hostname and rejects the target if **any** DNS answer is non-public;
3. pins the validated IP address to the actual socket connection, preventing a second DNS lookup from changing the destination after validation;
4. preserves the original HTTP `Host` header and HTTPS SNI/certificate hostname while connecting to the pinned address;
5. repeats the same validation and pinning for every redirect;
6. bounds DNS, connection, response-body time, redirect count, and sampled response size.

This design materially reduces SSRF and DNS-rebinding risk. `--allow-private` intentionally relaxes the address restriction for explicitly authorized internal assessments.

## Exit codes

- `0`: no high/medium findings
- `1`: at least one medium finding
- `2`: at least one high finding or execution error

This makes CyberEye usable as a CI quality gate. A first-party composite GitHub Action is included; see [docs/GITHUB_ACTION.md](docs/GITHUB_ACTION.md).

## Example output

A deliberately insecure local test target produces output like:

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

CyberEye exits with `1` for medium findings and `2` for high findings or execution errors, making it suitable for CI policy gates.

## GitHub Action

```yaml
- uses: MalsorEQ/fortezar-cybereye@v0.1.0
  with:
    target: https://example.com
    format: sarif
    output: cybereye.sarif
```

See [docs/GITHUB_ACTION.md](docs/GITHUB_ACTION.md) for a complete SARIF upload workflow and [docs/GITHUB_MARKETPLACE.md](docs/GITHUB_MARKETPLACE.md) for Marketplace publication details.

## Output formats

**Text** is designed for humans and terminal use. **JSON** is intended for automation and integrations. **SARIF 2.1.0** can feed compatible code-scanning workflows:

```bash
cybereye https://example.com --format sarif --output cybereye.sarif
```

## Security philosophy

CyberEye follows six principles:

1. **Passive by default** — observe before interacting.
2. **Authorization first** — never normalize unauthorized scanning.
3. **Safe networking** — validate and pin destinations before connecting.
4. **Bounded requests** — limit time, redirects, and sampled response data.
5. **Explainable findings** — every rule has evidence and remediation guidance.
6. **No fake certainty** — a clean report does not prove a site is secure.

See [SECURITY.md](SECURITY.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development

```bash
npm ci
npm run check
npm pack --dry-run
```

The test suite includes network-safety, DNS-pinning, redirect, and rule-engine coverage. CI runs against supported Node.js majors and CodeQL performs static security analysis.

## Roadmap

Planned areas include richer TLS/certificate checks, DNS security checks, a formal rule schema, baseline/suppression files with expiry, signed release provenance, plugin APIs, and optional integration with ForteZar Cloud.

See [ROADMAP.md](ROADMAP.md).

Maintainers: see [docs/PUBLISHING.md](docs/PUBLISHING.md) for the npm release process.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first. New rules should be passive, reproducible, documented, tested, and have low false-positive risk.

## Responsible use

CyberEye is intended for defensive security, secure software development, and authorized assessment. Do not use it to target systems without permission.

## License

Apache License 2.0. See [LICENSE](LICENSE).
