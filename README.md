# ForteZar CyberEye

**Open-source passive web security scanning for developers, CI, and security teams.**

CyberEye inspects externally observable web-security posture without exploitation. It is designed to provide fast, explainable checks that developers can run locally or in CI before deploying a site.

> **Authorization matters:** only assess systems you own or have explicit permission to test. CyberEye intentionally starts with passive checks and blocks private/loopback targets unless explicitly enabled.

## Why CyberEye exists

Security checks should be easy to run before production. CyberEye focuses on high-signal, developer-friendly checks with transparent evidence and remediation guidance rather than opaque scoring.

CyberEye is the open-source developer tool in the broader **ForteZar** ecosystem. The commercial ForteZar platform remains separate and private.

## Current checks

CyberEye v0.1.0 can identify:

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

The first release intentionally avoids brute force, exploitation, fuzzing, credential attacks, destructive requests, or stealth/evasion features.

## Install

Requires Node.js 20 or newer.

```bash
npm install -g fortezar-cybereye
```

During early development you can run it directly from the repository:

```bash
node ./bin/cybereye.js https://example.com
```

## Usage

```bash
cybereye https://example.com
cybereye https://example.com --format json
cybereye https://example.com --format sarif --output cybereye.sarif
```

Private/loopback addresses are blocked by default. For an internal environment that you are authorized to test:

```bash
cybereye https://staging.internal --allow-private
```

## Exit codes

- `0`: no high/medium findings
- `1`: at least one medium finding
- `2`: at least one high finding or execution error

This makes CyberEye usable as a CI quality gate. A first-party composite GitHub Action is included; see [docs/GITHUB_ACTION.md](docs/GITHUB_ACTION.md).

## SARIF

CyberEye can emit SARIF 2.1.0 for integration with compatible code-scanning workflows:

```bash
cybereye https://example.com --format sarif --output cybereye.sarif
```

## Security philosophy

CyberEye follows these principles:

1. **Passive by default** — observe before interacting.
2. **Authorization first** — never normalize unauthorized scanning.
3. **Safe networking** — reject non-HTTP(S) targets, credentials in URLs, and private/loopback targets by default.
4. **Bounded requests** — timeouts and response-size limits reduce accidental resource abuse.
5. **Explainable findings** — every rule has evidence and remediation guidance.
6. **No fake certainty** — a clean CyberEye report does not prove a site is secure.

See [SECURITY.md](SECURITY.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Roadmap

Planned areas include a formal rule schema, richer TLS checks, redirect-chain analysis, DNS security checks, GitHub Action packaging, baseline/suppression files, signed releases, plugin APIs, and optional integration with ForteZar Cloud.

See [ROADMAP.md](ROADMAP.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first. New rules should be passive, reproducible, documented, tested, and have low false-positive risk.

## Responsible use

CyberEye is intended for defensive security, secure software development, and authorized assessment. Do not use it to target systems without permission.

## License

Apache License 2.0. See [LICENSE](LICENSE).
