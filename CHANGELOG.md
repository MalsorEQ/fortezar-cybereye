# Changelog

## 0.1.0 — Unreleased

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
