# Publishing ForteZar CyberEye to npm

ForteZar CyberEye uses an explicit two-stage publishing model:

1. the **first npm publication is interactive with maintainer 2FA**;
2. later releases are staged from GitHub Actions and require a maintainer to approve the staged publication with 2FA.

This avoids storing a long-lived npm write token in GitHub while keeping a human approval step for this dual-use security package.

## One-time first publication

Publish the first npm package from the immutable GitHub release tag `v0.1.1`.

```bash
git clone https://github.com/MalsorEQ/fortezar-cybereye.git
cd fortezar-cybereye
git checkout v0.1.1
npm ci --ignore-scripts
npm run check
npm pack --dry-run
npm login
npm publish
```

Use an npm account with 2FA enabled. Do not paste npm credentials, one-time codes, recovery codes, or access tokens into issues, pull requests, repository files, or chat logs.

After publishing, verify that `fortezar-cybereye@0.1.1` is visible on npm and that:

```bash
npm install -g fortezar-cybereye
cybereye --version
```

prints `0.1.1`.

## Future releases: staged publishing

CyberEye is a defensive security scanner and is declared as dual-use package content. Future GitHub releases therefore use the staged publishing workflow in `.github/workflows/publish.yml`.

For each future release:

1. update `package.json`, `package-lock.json`, and `CHANGELOG.md`;
2. merge through protected `main` only after CI and CodeQL pass;
3. create a GitHub release whose tag is exactly `v<package-version>`;
4. GitHub Actions validates the tag/version match, runs tests, and stages the npm publication;
5. a maintainer reviews the staged package and approves publication with npm 2FA.

The workflow requests only:

- `contents: read`
- `id-token: write`

Do not configure a long-lived npm automation token unless there is a documented reason and security review.

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
- `contentPolicy.class` remains `dual-use`;
- the root `DISCLOSURE` file is present and accurate;
- no credentials, tokens, private data, generated secrets, recovery codes, or 2FA codes are present.
