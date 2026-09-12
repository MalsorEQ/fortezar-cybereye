# Security Policy

## Reporting a vulnerability in CyberEye

Please do not publish exploit details for an unpatched vulnerability in CyberEye. Until a dedicated security inbox is published, open a GitHub issue containing only non-sensitive coordination information and ask for a private reporting channel. Do not include secrets, customer data, or weaponized proof-of-concept material in a public issue.

## Supported versions

During the 0.x phase, only the latest released version is supported.

## Scope and responsible use

CyberEye is a defensive, passive-first scanner. It is not an authorization bypass. Users are responsible for ensuring they have permission to assess a target.

The project will not accept features whose primary purpose is credential attacks, destructive exploitation, malware delivery, persistence, stealth/evasion, or scanning arbitrary private networks without explicit operator opt-in.

## Safe networking

By default CyberEye:

- accepts only HTTP(S) targets and rejects credentials embedded in URLs;
- rejects private, loopback, link-local, reserved, documentation, multicast, and other non-public destinations;
- rejects a hostname when any resolved address is non-public;
- pins the validated DNS answer to the actual socket connection to reduce DNS-rebinding/TOCTOU risk;
- preserves the original hostname for HTTP Host and HTTPS SNI/certificate validation;
- revalidates and repins every redirect target;
- applies bounded DNS, connection, body, and redirect limits;
- caps sampled HTML and `security.txt` content.

`--allow-private` is an explicit operator override intended only for authorized internal environments.

## Security boundaries

CyberEye does not execute target JavaScript, submit forms, authenticate, brute-force credentials, exploit findings, or follow non-HTTP(S) schemes. A clean report is not a guarantee of security; CyberEye only reports the checks it performs.
