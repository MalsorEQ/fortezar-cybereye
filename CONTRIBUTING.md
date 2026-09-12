# Contributing to ForteZar CyberEye

Thank you for helping improve CyberEye.

## Development

```bash
npm install
npm run check
node ./bin/cybereye.js https://example.com
```

## Pull requests

Keep changes focused and include tests. Explain security assumptions and expected false-positive behavior for new rules.

### New rule requirements

A new detection rule should:

- rely on passive or clearly safe observations by default;
- have a stable rule ID;
- describe the security impact without exaggeration;
- include concrete remediation guidance;
- avoid collecting sensitive response content unnecessarily;
- include automated tests;
- reference an established standard or defensible security rationale when possible.

Features that materially increase offensive capability require maintainership review and may be rejected even if technically feasible.

## Style

Prefer standard-library functionality and minimal dependencies. Keep outputs deterministic and machine-readable.
