# Architecture

CyberEye is intentionally small, dependency-light, and auditable.

```text
CLI
 └─ URL policy
     └─ DNS resolve + address validation
         └─ validated-address socket pinning
             └─ passive HTTP(S) observation
                 ├─ redirect revalidation
                 ├─ response headers
                 ├─ cookies
                 ├─ bounded HTML sample
                 └─ bounded security.txt sample
                     └─ rule engine
                         ├─ text reporter
                         ├─ JSON reporter
                         └─ SARIF reporter
```

## Network trust boundary

The target, DNS answers, redirects, headers, and response body are all untrusted.

For public scans, CyberEye resolves a hostname once, rejects the target if any returned address is non-public, then opens the socket directly to the selected validated address. The original hostname is retained for the HTTP `Host` header and for TLS SNI/certificate hostname validation. This removes the usual validate-then-resolve-again gap that enables DNS-rebinding races.

Every redirect is treated as a new trust decision and goes through the same resolution, validation, and pinning path. DNS, socket establishment, response bodies, redirect depth, and sampled content are bounded.

`--allow-private` deliberately relaxes address restrictions for authorized internal testing; protocol and URL credential restrictions still apply.

## Content trust boundary

CyberEye does not execute target JavaScript, submit target forms, interpret returned content as instructions, or follow non-HTTP(S) schemes. HTML is sampled only up to a fixed byte limit for passive pattern checks.

## Rule engine

Rules consume a normalized observation rather than issuing their own network requests. This keeps networking policy centralized and makes rules easier to audit and test.

## Commercial boundary

CyberEye must remain useful as a standalone open-source tool. Future ForteZar Cloud integrations should be optional and must not move core open-source checks behind a proprietary service.
