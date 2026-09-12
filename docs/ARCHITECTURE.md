# Architecture

CyberEye is intentionally small and auditable.

```text
CLI
 └─ target validation
     └─ passive HTTP observation
         ├─ response headers
         ├─ cookies
         ├─ bounded HTML sample
         └─ security.txt
             └─ rule engine
                 ├─ text reporter
                 ├─ JSON reporter
                 └─ SARIF reporter
```

## Trust boundaries

The target is untrusted. CyberEye must not execute target JavaScript, follow non-HTTP(S) schemes, trust redirects into private address space, or interpret returned content as instructions.

## Commercial boundary

CyberEye must remain usable as a standalone open-source tool. Future ForteZar Cloud integrations should be optional and should not move core open-source checks behind a proprietary service.
