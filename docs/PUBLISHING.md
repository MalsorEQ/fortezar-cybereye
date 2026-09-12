# Publishing ForteZar CyberEye to npm

ForteZar CyberEye uses an explicit two-stage publishing model:

1. the **first npm publication is interactive**;
2. later releases are published from GitHub Actions with npm Trusted Publishing (OIDC).

This avoids storing a long-lived npm write token in GitHub.

## One-time first publication

npm Trusted Publishing can only be attached after the package already exists in the npm registry. Publish the first version from the immutable GitHub release tag.

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
git checkout v0.1.0
npm ci --ignore-scripts
npm run check
npm pack --dry-run
npm login
npm publish
```

Use an npm account with 2FA enabled. Do not paste npm credentials or access tokens into issues, pull requests, repository files, or chat logs.

After publishing, verify that `fortezar-cybereye@0.1.0` is visible on npm and that:

```bash
npm install -g fortezar-cybereye
cybereye --version
```

prints `0.1.0`.

## Configure Trusted Publishing for future releases

After the package exists on npm, open its npm package settings and add a **GitHub Actions Trusted Publisher** with:

- GitHub user/organization: `MalsorEQ`
- Repository: `fortezar-cybereye`
- Workflow filename: `publish.yml`
- Allowed action: `npm publish`

The workflow is stored at `.github/workflows/publish.yml` and requests only:

- `contents: read`
- `id-token: write`

For future versions, update `package.json` and `CHANGELOG.md`, merge through the protected `main` branch, and publish a GitHub release whose tag exactly matches `v<package-version>`. The workflow verifies the tag/version match, runs the checks, performs a package dry-run, and then publishes with OIDC.

Trusted publishing automatically provides npm provenance for eligible public GitHub repositories and public packages.

## Release checklist

Before every release:

```bash
npm ci --ignore-scripts
npm run release:check
```

Then confirm:

- CI is green on supported Node.js versions;
- CodeQL is green;
- the changelog matches the release;
- the package version is correct;
- the Git tag is exactly `v<version>`;
- no credentials, tokens, private data, or generated secrets are present.
