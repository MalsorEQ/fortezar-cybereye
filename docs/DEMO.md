# Safe local demo

This demo lets you see ForteZar CyberEye produce real findings without scanning a third-party system.

The included demo server binds only to `127.0.0.1` and intentionally omits several common security controls. CyberEye still requires `--allow-private` because loopback/private destinations are blocked by default.

## 1. Clone and install

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
npm ci --ignore-scripts
```

## 2. Start the intentionally weak local target

```bash
node ./scripts/demo-server.mjs
```

The server listens on:

```text
http://127.0.0.1:8787
```

## 3. Run CyberEye in a second terminal

```bash
node ./bin/cybereye.js http://127.0.0.1:8787 --allow-private
```

Because the target is intentionally weak, CyberEye should report several findings, including examples such as:

- `CE001` — HTTPS is not enforced
- `CE003` — Content Security Policy is missing
- `CE008` — CORS allows any origin
- `CE009` — technology details are disclosed
- `CE011` / `CE012` — weak cookie attributes
- `CE013` — `security.txt` is missing
- `CE014` — insecure form action

The exact score and summary may evolve as the rule set changes. The important behavior is that the demo is deterministic, local, passive, and safe to reproduce.

CyberEye exits with code `2` when a high-severity finding is present, so a non-zero exit from this intentionally insecure demo is expected.

## Cleanup

Stop the demo server with `Ctrl+C`.

## Responsible use

Use CyberEye only on systems you own or are explicitly authorized to assess. The local demo is provided so new users and contributors can evaluate the scanner without targeting public infrastructure.
