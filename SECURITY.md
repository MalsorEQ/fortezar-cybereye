# Security Policy

## Reporting a vulnerability in CyberEye

Please do not publish exploit details for an unpatched vulnerability in CyberEye. Until a dedicated security inbox is published, open a GitHub issue containing only non-sensitive coordination information and ask for a private reporting channel. Do not include secrets, customer data, or weaponized proof-of-concept material in a public issue.

## Supported versions

During the 0.x phase, only the latest released version is supported.

## Scope and responsible use

CyberEye is a defensive, passive-first scanner. It is not an authorization bypass. Users are responsible for ensuring they have permission to assess a target.

The project will not accept features whose primary purpose is credential attacks, destructive exploitation, malware delivery, persistence, stealth/evasion, or scanning arbitrary private networks without explicit operator opt-in.

## Safe defaults

CyberEye blocks private and loopback targets by default, restricts targets to HTTP(S), rejects credentials embedded in URLs, uses bounded request timeouts, and caps sampled HTML.
