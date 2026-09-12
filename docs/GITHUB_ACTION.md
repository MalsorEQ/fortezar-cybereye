# GitHub Action

CyberEye can be used as a composite GitHub Action after the repository is tagged.

```yaml
name: Web security posture

on:
  workflow_dispatch:
  deployment_status:

permissions:
  contents: read
  security-events: write

jobs:
  cybereye:
    runs-on: ubuntu-latest
    steps:
      - uses: MalsorEQ/fortezar-cybereye@v0.1.0
        id: cybereye
        with:
          target: https://example.com
          format: sarif
          output: cybereye.sarif

      - uses: github/codeql-action/upload-sarif@v4
        if: always()
        with:
          sarif_file: cybereye.sarif
```

The action exposes `exit-code` and `report-path` outputs. CyberEye returns `1` for medium findings and `2` for high findings or execution errors, so the scan step acts as a security gate by default.

Use only against systems you own or are authorized to assess.

For production pipelines, pin third-party actions to immutable commit SHAs according to your supply-chain policy. Tags such as `v0.1.0` are shown above for readability and versioned release usage.
