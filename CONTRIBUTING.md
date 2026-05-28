# Contributing to ServiceLens

Thank you for your interest in contributing! This document explains how to set up the project, what kinds of contributions are welcome, and how to submit them.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Policy](#testing-policy)
- [Testing Your Changes](#testing-your-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Commit Conventions](#commit-conventions)
- [Developer Certificate of Origin (DCO)](#developer-certificate-of-origin-dco)
- [Collaborator Access Policy](#collaborator-access-policy)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Chrome** (any recent stable version)
- **Git**

### Fork and clone

```bash
# 1. Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/ServiceLens.git
cd ServiceLens

# 2. Add upstream remote
git remote add upstream https://github.com/RishavRajSingh44/ServiceLens.git

# 3. Install dependencies
npm install
```

---

## Development Workflow

### UI development (fast iteration)

```bash
npm run dev
```

Opens `localhost:5173` with hot reload. Useful for iterating on layout and component logic. Note: `chrome.*` APIs are not available here — the panel will log a warning and skip request capture.

### Full extension testing

```bash
npm run build
```

Then load `dist/` as an unpacked extension:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `dist/`
4. Open DevTools on any page → **Network Inspector** tab

After changing source files, run `npm run build` again and click the **reload icon** on the extension card in `chrome://extensions`. You may need to close and reopen DevTools.

### Lint

```bash
npm run lint
```

All PRs must pass lint with zero errors.

---

---

## Testing Policy

All major changes to the codebase **must** add or update tests in the automated test suite. Specifically:

- **Any change to `src/lib/classifier.js`** must include a corresponding test in `tests/classifier.test.js`. PRs that modify classifier logic without tests will not be merged.
- **New UI components or hooks** should include at minimum a smoke test verifying the component renders without errors.
- **Bug fixes** should include a regression test that reproduces the bug before the fix and passes after.

Tests are run automatically on every push and pull request via CI. See [docs/TESTING.md](docs/TESTING.md) for how to run them locally and what to test manually.

---

## Testing Your Changes

There is an automated unit test suite for the classification logic. Run it with:

```bash
npm test
```

Tests live in `tests/classifier.test.js`. **Any change to `src/lib/classifier.js` must include a corresponding test.** PRs that modify the classifier without adding or updating tests will not be merged.

For full manual testing steps before submitting a PR, see [docs/TESTING.md](docs/TESTING.md).

At minimum before submitting:

- [ ] `npm run lint` passes with zero errors
- [ ] `npm test` passes
- [ ] `npm run build` completes successfully
- [ ] The extension loads and works correctly as described in [docs/TESTING.md](docs/TESTING.md)

---

## Submitting a Pull Request

1. **Open an issue first** for significant changes or new features. This avoids duplicated work.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-change
   ```
3. Make your changes. Keep each PR focused on one concern.
4. Sign your commits with a DCO sign-off (see below).
5. Push and open a PR against `main`.
6. Fill in the PR description explaining *what* changed and *why*.
7. Address review feedback promptly.

---

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

Signed-off-by: Your Name <your@email.com>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(classifier): filter Google Fonts requests as internal
fix(panel): prevent duplicate requests on fast reconnect
docs: add DCO section to CONTRIBUTING
```

---

## Developer Certificate of Origin (DCO)

This project uses the [DCO](https://developercertificate.org/) instead of a CLA. By signing off your commit you certify that you have the right to submit the contribution under the project's MIT license.

Add a sign-off to every commit:

```bash
git commit -s -m "feat: my change"
```

This appends `Signed-off-by: Your Name <your@email.com>` to the commit message. If you forget, you can amend:

```bash
git commit --amend -s --no-edit
```

PRs without a DCO sign-off on every commit will not be merged.

---

## Collaborator Access Policy

Write and admin access to this repository is granted manually by the maintainer. The process is:

1. A contributor demonstrates good-faith contributions via issues or pull requests
2. The maintainer reviews the contributor's GitHub history and intent
3. Access is granted at the minimum level needed (triage before write, write before maintain)
4. GitHub defaults new outside collaborators to read-only — elevated permissions require explicit action

If you are interested in becoming a regular contributor or maintainer, open an issue or reach out via GitHub.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/RishavRajSingh44/ServiceLens/issues) and include:

- Chrome version
- Extension version (from `chrome://extensions`)
- Steps to reproduce
- What you expected vs. what happened
- Console errors (DevTools → Console)

For security vulnerabilities, see [SECURITY.md](SECURITY.md) instead.

---

## Requesting Features

Open an issue with the label `enhancement`. Describe the use case, not just the feature — explaining *why* helps evaluate fit.
