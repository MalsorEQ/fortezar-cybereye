# GitHub Action

CyberEye can be used directly as a composite GitHub Action once the repository is published and tagged.

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
        with:
          target: https://example.com
          format: sarif
          output: cybereye.sarif

      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: cybereye.sarif
```

Use only against systems you own or are authorized to assess.

For production pipelines, pin third-party actions to immutable commit SHAs according to your supply-chain policy.
