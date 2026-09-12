# OSS Adoption Playbook

This document is the maintainer-facing plan for growing ForteZar CyberEye through genuine developer and security-community adoption.

The goal is not to manufacture stars, downloads, contributors, or social proof. The goal is to make CyberEye useful enough that real users try it, keep using it, recommend it, open issues, and contribute improvements.

## 1. Core positioning

Primary message:

> ForteZar CyberEye is a passive-first web-security scanner for developers and CI that produces explainable findings without exploitation.

Supporting points:

- install in seconds with `npx` or npm;
- 15 passive security checks;
- text, JSON, and SARIF output;
- GitHub Actions / Marketplace integration;
- no runtime dependencies;
- safe target validation and DNS pinning;
- private/loopback targets blocked unless explicitly authorized;
- Apache-2.0 licensed.

Avoid claims such as "complete security scanner", "finds every vulnerability", or "enterprise-grade" until there is evidence to support them.

## 2. Launch assets

Before posting broadly, every launch surface should point to the same simple first-run experience:

```bash
npx fortezar-cybereye@latest https://example.com
```

For a safe reproducible demo, use `docs/DEMO.md` instead of encouraging people to scan random public sites.

The launch package should contain:

- repository link;
- npm package link;
- GitHub Marketplace listing;
- one terminal screenshot or short demo video;
- one copy-paste GitHub Actions example;
- one sentence about responsible/authorized use;
- an explicit request for feedback, not stars.

## 3. Reusable launch copy

### Short developer post

> I built ForteZar CyberEye, an open-source passive web-security scanner for developers and CI. It checks common externally visible security issues, outputs text/JSON/SARIF, and ships as both an npm CLI and GitHub Action. It avoids exploitation and blocks private/loopback targets by default. Feedback on the rules, false positives, CI integration, and contributor experience is especially welcome.

### Technical security-community post

> ForteZar CyberEye is a small Apache-2.0 passive-first scanner focused on explainable web-security findings and safe networking. Current coverage includes HTTPS/HSTS/CSP/CORS/cookie/security-header checks, insecure forms, mixed content, and security.txt. The networking layer validates DNS answers, rejects non-public destinations by default, pins validated addresses to the socket connection, and revalidates redirects. I am looking for technical review of false-positive behavior, rule design, and additional passive checks.

### Contributor call

> CyberEye is now open to outside contributions. There are newcomer-friendly issues for rule documentation and CLI output tests, plus a larger help-wanted issue for a passive certificate-expiry check. New rules need tests, remediation guidance, and a clear false-positive discussion.

Do not post the same message repeatedly across communities. Adapt the wording to each community and follow local self-promotion rules.

## 4. Distribution sequence

Use a staged launch instead of posting everywhere at once.

### Stage A — trusted technical feedback

Share first with a small number of developers/security practitioners who are likely to give substantive feedback. Ask them to try one of:

```bash
npx fortezar-cybereye@latest https://example.com
```

or the local demo in `docs/DEMO.md`.

Questions to ask:

- Was installation frictionless?
- Were findings understandable?
- Which finding looked wrong or noisy?
- Was remediation useful?
- Would you run it locally, in CI, or neither?
- What passive check is missing?

### Stage B — developer communities

Suitable categories include:

- JavaScript / Node.js developer communities;
- DevOps / DevSecOps communities;
- GitHub Actions users;
- open-source maintainer communities;
- developer-security forums and discussion groups.

The post should lead with the use case and demo, not with "please star my repo".

### Stage C — security communities

When sharing with security practitioners, emphasize architecture, limitations, safe networking, false-positive handling, and the fact that CyberEye is intentionally passive-first.

Invite review of:

- rule severity;
- detection rationale;
- SSRF/rebinding protections;
- SARIF usefulness;
- missing passive checks.

### Stage D — educational/tutorial content

Publish small practical tutorials that answer one concrete question each. Examples:

1. "Add a passive web-security check to GitHub Actions in 2 minutes"
2. "Generate SARIF from a website security scan"
3. "Why DNS pinning matters in a URL scanner"
4. "How to test security headers without exploiting a site"
5. "Understanding CSP, HSTS, CORS, and cookie findings with CyberEye"

Tutorials should teach the underlying security idea even if the reader never adopts CyberEye.

## 5. First 30-day operating cadence

### Weekly

- respond to every legitimate issue and PR;
- review false-positive reports quickly;
- merge small contributor improvements when they meet quality/security standards;
- publish one useful technical example, explanation, or demo;
- review npm/download and GitHub traffic trends;
- identify the single biggest onboarding friction point.

### Do not

- buy stars, followers, traffic, or installs;
- ask friends to create fake activity;
- mass-DM maintainers;
- spam identical launch posts;
- create fake contributor accounts;
- inflate npm downloads by automated installs;
- promise roadmap dates that are not realistic.

## 6. Metrics that matter

Raw stars are useful as one signal but should never be the primary objective.

Track:

### Activation

- successful npm/npx usage;
- Marketplace/action usage when available;
- README-to-install conversion clues from traffic trends;
- demo completion feedback.

### Product quality

- valid bug reports;
- false-positive reports;
- rule-improvement suggestions;
- repeat users mentioning CI/local integration;
- time from issue report to maintainer response.

### Community

- outside issues opened;
- outside PRs opened;
- outside PRs merged;
- unique contributors;
- meaningful discussions/reviews;
- users referencing CyberEye from other repositories or posts.

### Retention proxies

For a CLI project there may not be direct user accounts, so retention is inferred from:

- repeat npm usage trends;
- repositories repeatedly invoking the GitHub Action;
- users returning with feature requests or rule feedback;
- contributors making a second contribution.

## 7. Simple weekly scorecard

Record once per week:

| Metric | This week | Previous week | Notes |
| --- | ---: | ---: | --- |
| npm downloads |  |  |  |
| GitHub unique visitors |  |  |  |
| Repo clones |  |  |  |
| Stars |  |  |  |
| New external issues |  |  |  |
| New external PRs |  |  |  |
| External PRs merged |  |  |  |
| Valid bug reports |  |  |  |
| False-positive reports |  |  |  |
| Median maintainer response time |  |  |  |

Do not interpret one noisy week as a trend. Look for improvement across several weeks.

## 8. Contribution funnel

CyberEye should always have a few clearly scoped open issues across different difficulty levels:

- documentation / standards references;
- tests and cross-platform reliability;
- rule-quality improvements;
- developer experience;
- advanced passive checks requiring security review.

A healthy project should not reserve every useful task for maintainers. At the same time, security-sensitive networking changes should never be made easier merely to attract contributors.

## 9. Credibility milestones

Stronger credibility comes from evidence such as:

- multiple releases with reliable CI;
- public changelog and security policy;
- external issue reports that lead to fixes;
- external contributors whose PRs are merged;
- transparent discussion of false positives and limitations;
- references to standards for detection rules;
- reproducible demos and documentation;
- stable CI/Marketplace/npm integrations;
- evidence that real repositories use the Action or CLI.

These are more meaningful than a large star count with little real usage.

## 10. Open-source maintainer program readiness

If applying to an external OSS-maintainer support program in the future, prepare a concise evidence package rather than optimizing the project around the application itself.

Useful evidence may include:

- public repository history;
- release cadence;
- npm and GitHub Marketplace distribution;
- real adoption metrics;
- outside contributors;
- issue/PR responsiveness;
- security and governance documentation;
- concrete examples of how maintainers use AI/coding tools to improve the project responsibly.

Program acceptance is never guaranteed. The best strategy is to build a useful, actively maintained project with demonstrable real users.

## 11. Immediate next actions

1. Merge onboarding/demo improvements after CI and CodeQL.
2. Share CyberEye with a small technical feedback group before broad promotion.
3. Publish one short demo showing install → scan → understandable findings.
4. Publish one GitHub Actions tutorial.
5. Keep at least two newcomer-friendly issues open.
6. Respond quickly to every legitimate external issue or PR.
7. Record the weekly scorecard for four weeks before judging whether distribution is working.
