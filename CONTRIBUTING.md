# Contributing to ForteZar CyberEye

Thank you for helping improve CyberEye. Contributions that make the scanner safer, clearer, easier to adopt, or more accurate are welcome.

## Before you start

CyberEye is a defensive, passive-first security tool. Please do not submit features whose primary value is exploitation, credential attacks, stealth/evasion, destructive behavior, or unauthorized access.

For security vulnerabilities in CyberEye itself, follow [SECURITY.md](SECURITY.md) rather than opening a public issue with exploit details.

## Development setup

Requires Node.js 20 or newer.

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
npm ci --ignore-scripts
npm run check
```

To try the scanner without targeting a third-party system, use the safe local demo:

```bash
node ./scripts/demo-server.mjs
```

Then, in a second terminal:

```bash
node ./bin/cybereye.js http://127.0.0.1:8787 --allow-private
```

See [docs/DEMO.md](docs/DEMO.md) for details.

## Good first contributions

Contributor-sized improvements include:

- improving documentation or examples;
- adding tests for edge cases;
- improving error messages or output clarity;
- adding standards references to existing rules;
- improving false-positive resistance;
- adding safe, passive checks with a clear security rationale.

Check open issues before starting substantial work. If an issue is unassigned, leave a short comment describing your intended approach before investing heavily.

## Pull requests

Keep changes focused and easy to review. A good PR should:

1. explain the problem and why the change is useful;
2. include tests when behavior changes;
3. document security assumptions and false-positive tradeoffs;
4. keep output deterministic and machine-readable;
5. update documentation when user-facing behavior changes;
6. pass `npm run check` and `npm pack --dry-run`.

Avoid mixing unrelated refactors into a security-rule change.

### New rule requirements

A new detection rule should:

- rely on passive or clearly safe observations by default;
- have a stable rule ID;
- describe the security impact without exaggeration;
- include concrete remediation guidance;
- avoid collecting sensitive response content unnecessarily;
- include automated tests;
- explain expected false positives and limitations;
- reference an established standard or defensible security rationale when possible.

Features that materially increase offensive capability require maintainership review and may be rejected even if technically feasible.

## Style

Prefer standard-library functionality and minimal dependencies. Keep implementation straightforward and auditable. Security-sensitive networking behavior should favor explicit validation over convenience.

## Review expectations

Maintainers may ask for tighter scope, additional tests, clearer remediation language, or a safer implementation before merging. Security and networking changes receive stricter review because they affect the trust boundary of the scanner.

## Code of conduct

Participation in this project is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
