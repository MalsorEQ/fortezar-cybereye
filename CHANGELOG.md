# Changelog

## 0.1.2 — Unreleased

### Fixed
- Make `cybereye --version` read the version from `package.json` instead of a hard-coded string
- Keep the default CyberEye User-Agent version synchronized with the package version
- Add a regression test that verifies CLI version output matches package metadata

## 0.1.1 — 2026-09-12

### Fixed
- Normalize the npm `bin` path so the `cybereye` CLI entry is preserved when published
- Add npm dual-use security package metadata
- Add a root `DISCLOSURE` file describing CyberEye's legitimate defensive purpose and safe-use expectations
- Change future npm delivery to staged publishing so a maintainer approves each release with 2FA

## 0.1.0 — 2026-09-12

### Added
- Initial passive web-security scanner
- 15 explainable security checks
- Text, JSON, and SARIF reporters
- First-party composite GitHub Action
- CI matrix, CodeQL, Dependabot, tests, and project governance files
- Cross-platform syntax validation for contributors

### Security
- Private, loopback, link-local, reserved, documentation, multicast, and other non-public target blocking by default
- Validation of every redirect destination before connection
- DNS answer pinning to the actual socket to reduce DNS-rebinding/TOCTOU risk
- Mixed public/private DNS answer rejection
- Bounded DNS, connection, response body, redirect, HTML sample, and `security.txt` operations
