# ForteZar CyberEye — First Launch Content Pack

Use these as starting points, not spam templates. Adapt wording to the norms of each community and answer feedback personally.

## 1. Short developer launch post

I just released **ForteZar CyberEye**, an open-source passive web-security scanner for developers and CI.

It checks common externally visible security issues like HTTPS/HSTS, CSP, CORS, cookie flags, mixed content, insecure form actions, `security.txt`, and other security headers.

Try it without installing globally:

```bash
npx fortezar-cybereye@latest https://example.com
```

It outputs text, JSON, or SARIF, works in GitHub Actions, and blocks private/loopback targets by default unless you explicitly opt in for an authorized internal assessment.

The project is Apache-2.0 and I’m looking for real feedback on false positives, missing checks, CI usability, and contributor experience.

GitHub: https://github.com/MalsorEQ/fortezar-cybereye

Please only scan systems you own or are authorized to assess.

## 2. Technical security launch post

I’ve released **ForteZar CyberEye**, a passive-first open-source web-security scanner focused on explainable findings and safe network handling.

Current scope includes 15 observable checks across transport/header posture, CSP, CORS, cookie attributes, mixed content, insecure form actions, `security.txt`, and technology disclosure.

The network path is intentionally defensive:

- only `http://` and `https://` targets are accepted;
- embedded credentials are rejected;
- DNS answers are resolved and validated before connection;
- mixed public/private DNS answers are rejected;
- the validated public IP is pinned to the socket connection;
- Host/SNI/certificate hostname semantics are preserved;
- every redirect is revalidated and repinned;
- DNS, connect, response-body, redirect, and sample-size limits are bounded;
- private and loopback destinations require explicit `--allow-private` opt-in.

The goal is not to claim full vulnerability coverage. It is to provide a small set of high-signal, reproducible checks that developers can run locally or in CI with text, JSON, and SARIF output.

Quick start:

```bash
npx fortezar-cybereye@latest https://example.com
```

Repository: https://github.com/MalsorEQ/fortezar-cybereye

I’d especially value feedback on false-positive behavior, rule rationale, SARIF integration, networking assumptions, and what passive checks would be most useful next.

Use only on systems you own or have explicit authorization to assess.

## 3. 30–60 second demo script

### Goal

Show: install-free run → findings → safe local demo → GitHub repo.

### Recording setup

- Terminal font large enough to read on mobile.
- Use a clean terminal window with no secrets/history visible.
- Record at 1080p if possible.
- Keep cursor movement minimal.
- Do not scan a random third-party site. Use the included localhost demo target.

### Terminal 1 — start local demo target

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
npm ci --ignore-scripts
node ./scripts/demo-server.mjs
```

Expected endpoint:

```text
http://127.0.0.1:8787
```

### Terminal 2 — run released npm package

```bash
npx fortezar-cybereye@latest http://127.0.0.1:8787 --allow-private
```

### Suggested timeline

**0–5s**

On-screen text:

> "I built an open-source web-security scanner you can run with one command."

Show:

```bash
npx fortezar-cybereye@latest http://127.0.0.1:8787 --allow-private
```

**5–20s**

Let the scan finish. Keep the findings visible.

Voice/text:

> "CyberEye performs passive checks for things like HTTPS, CSP, CORS, cookie flags, security headers, mixed content, and insecure forms."

**20–35s**

Scroll just enough to show several rule IDs and severities.

Voice/text:

> "Each finding is explainable and includes remediation instead of pretending a clean scan proves a site is secure."

**35–48s**

Show the GitHub repository README and badges.

Voice/text:

> "It supports text, JSON, SARIF, GitHub Actions, and safe networking protections like redirect validation and DNS pinning."

**48–60s**

Show repository URL and contribution issues.

Voice/text:

> "It’s Apache-2.0 and open to contributors. I’m looking for real feedback on false positives and useful passive checks to add next."

Final overlay:

```text
github.com/MalsorEQ/fortezar-cybereye
npm: fortezar-cybereye
Authorized systems only
```

## 4. Short caption variants

### X / Threads / Bluesky

Released **ForteZar CyberEye** — an open-source passive web-security scanner for developers and CI.

```bash
npx fortezar-cybereye@latest https://example.com
```

15 explainable checks, text/JSON/SARIF, GitHub Actions, safe redirect/DNS handling, Apache-2.0.

Feedback and contributions welcome.

https://github.com/MalsorEQ/fortezar-cybereye

### LinkedIn

I’ve released the first public version of **ForteZar CyberEye**, an open-source passive web-security scanner built for developers, CI pipelines, and defensive security work.

The project currently checks 15 common externally observable security issues and supports text, JSON, SARIF, and GitHub Actions.

A major focus has been safe-by-default networking: public/private DNS validation, socket IP pinning, redirect revalidation, bounded requests, and explicit opt-in for authorized internal targets.

I’m now looking for real-world feedback from developers and security practitioners, especially around false positives, CI usability, and which passive checks should come next.

Repository: https://github.com/MalsorEQ/fortezar-cybereye

### Reddit / community-post framing

Title idea:

> I built an open-source passive web-security scanner for CI — looking for technical feedback

Body:

I’ve been building **ForteZar CyberEye**, a small Node.js scanner that focuses on passive, externally observable web-security checks rather than exploitation.

Current checks include HTTPS/HSTS, CSP, CORS, cookie flags, common security headers, `security.txt`, insecure form actions, mixed content, and basic technology disclosure. It can output text, JSON, or SARIF and has a GitHub Action.

One area I spent extra time on is safe target handling: every public target/redirect is DNS-resolved and validated, mixed public/private answers are rejected, and the validated IP is pinned to the socket while preserving Host/SNI semantics.

Try it with:

```bash
npx fortezar-cybereye@latest https://example.com
```

Repo: https://github.com/MalsorEQ/fortezar-cybereye

I’d appreciate critique on the rule set, false-positive risks, networking model, SARIF output, and what would make this actually useful in your CI workflow.

Authorized targets only.

## 5. Distribution sequence

Do not post everywhere on the same day. Use feedback from each step to improve the next one.

1. Personal GitHub/profile and one developer-oriented social post.
2. One technical security post with the demo video.
3. One relevant developer/security community where self-promotion is allowed.
4. Hacker News "Show HN" only after the README/demo have been tested by a few real users.
5. Reddit only in subreddits whose rules permit project sharing; write a technical post, not an ad.
6. DEV/Hashnode article explaining the safe networking model and CI use case.
7. Follow up with changelog-driven updates only when something meaningful improves.

## 6. What to measure after each post

Record these once per week rather than refreshing them constantly:

- npm downloads trend;
- unique external issues opened;
- external PRs opened/merged;
- repositories visibly using the GitHub Action;
- stars/forks as secondary indicators only;
- false-positive reports;
- install/CLI problems;
- repeated requests for the same rule/integration;
- time to first maintainer response;
- contributor conversion from issue to PR.

A small number of real users who provide actionable feedback is more valuable than a large number of low-intent impressions.
