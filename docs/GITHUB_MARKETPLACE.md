# GitHub Marketplace publication

ForteZar CyberEye includes a root `action.yml`, so it can be published as a GitHub Marketplace Action.

## Listing

Recommended Marketplace metadata:

- **Action name:** ForteZar CyberEye
- **Primary category:** Security
- **Secondary category:** Continuous integration
- **Short description:** Passive web-security checks with text, JSON, and SARIF output
- **Icon:** eye
- **Color:** blue

The icon and color are already declared in `action.yml`.

## Publish the existing v0.1.0 release

1. Accept the GitHub Marketplace Developer Agreement for the repository owner account.
2. Open the `v0.1.0` release and choose **Edit**.
3. Enable **Publish this Action to the GitHub Marketplace**.
4. Confirm GitHub reports that the action metadata is valid.
5. Choose **Security** as the primary category.
6. Choose **Continuous integration** as the secondary category.
7. Keep the release tag `v0.1.0` and update the release.

Do not create a second `v0.1.0` tag. Marketplace publication should reference the existing release.

## Consumer example

```yaml
name: Web security posture

on:
  workflow_dispatch:

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

      - uses: github/codeql-action/upload-sarif@v4
        if: always()
        with:
          sarif_file: cybereye.sarif
```

For higher-assurance environments, pin third-party actions to immutable commit SHAs according to your supply-chain policy.
