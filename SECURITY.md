# Security Policy

## Supported Versions

Only the latest release on `main` receives security updates. No backports are made to older commits.

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ Yes |
| older commits | ❌ No |

When a release is no longer the latest, it immediately stops receiving security updates. Users should always upgrade to the latest release.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in ServiceLens, please report it responsibly:

1. Go to the [GitHub Security Advisories](https://github.com/RishavRajSingh44/ServiceLens/security/advisories/new) page and submit a private advisory.
2. Alternatively, contact the maintainer directly via GitHub: [@RishavRajSingh44](https://github.com/RishavRajSingh44).

Please include:
- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fix (optional but appreciated)

## What to Expect

- Acknowledgement within **48 hours**
- A status update within **7 days**
- A fix or mitigation plan within **30 days** for critical issues

## Scope

The following are in scope:
- Malicious code execution triggered by inspected network request data
- Content Security Policy bypass in the DevTools panel
- `chrome.storage` data leakage to untrusted origins
- XSS via unescaped URL or header content rendered in the panel
- Privilege escalation via the extension's `storage` permission

The following are **out of scope**:
- Vulnerabilities in Chrome itself or the DevTools APIs
- Issues only reproducible with a malicious extension already installed
- Rate limiting or DoS on the inspected page's own backend

---

## Secrets and Credentials Policy

ServiceLens itself does not use secrets, API keys, or credentials at runtime — it is a browser extension with no backend.

For contributors and CI/CD:

- **Never commit** secrets, tokens, API keys, or credentials to the repository
- All CI secrets (e.g. `SCORECARD_TOKEN`) are stored exclusively in GitHub Actions Secrets and are never printed in logs
- Gitleaks secret scanning runs on every push and pull request and will block merges if credentials are detected
- If a secret is accidentally committed, rotate it immediately and open a private security advisory

---

## Collaborator Review Policy

New collaborators are not granted write or admin access without explicit review by the maintainer. GitHub defaults new outside collaborators to read-only access. Elevated permissions (triage, write, maintain, admin) are granted manually only after reviewing the contributor's history and intent.

---

## Threat Model and Attack Surface

ServiceLens operates entirely within the browser's DevTools context. The attack surface is:

| Entry point | Risk | Mitigation |
|---|---|---|
| Network request URLs rendered in the panel | XSS via unsanitized content | React's JSX escaping prevents injection; no `dangerouslySetInnerHTML` used |
| `chrome.storage.local` config data | Malicious rule injection | Config is user-controlled only; no external writes to storage |
| `chrome.devtools.network` events | Malicious page crafting deceptive URLs | Data is displayed only, never executed |
| Extension service worker ports | Message injection | Port messages are typed (`NETWORK_REQUEST`, `CLEAR_REQUESTS`, `CONFIG_UPDATE`) and structurally validated |

No network requests are made by the extension itself. No data leaves the browser.

---

## Release Integrity and Verification

Releases are published as GitHub Releases with a source zip and a built `dist/` artifact. To verify a release:

1. **Check the commit SHA** — each release tag points to a specific commit. Verify the tag against the commit history:
   ```bash
   git verify-commit <commit-sha>
   ```
2. **Check the release author** — all releases are authored by [@RishavRajSingh44](https://github.com/RishavRajSingh44). Verify the GitHub Release was created by that account.
3. **Verify the build** — build from source and compare the output to the released `dist/` artifact:
   ```bash
   npm ci && npm run build
   # compare dist/ contents with the released artifact
   ```

---

## Software Bill of Materials (SBOM)

A Software Bill of Materials is generated for each release using the `package-lock.json` dependency tree, which contains the full transitive dependency list with integrity hashes (SHA-512) for every package.

To inspect the SBOM for any release:
```bash
npm ci
cat package-lock.json   # full dependency tree with integrity hashes
```

For a machine-readable SBOM in CycloneDX or SPDX format, run:
```bash
npx @cyclonedx/cyclonedx-npm --output-format JSON --output-file sbom.json
```

---

## SCA (Dependency Vulnerability) Policy

- All changes are automatically evaluated against known vulnerabilities via `npm audit --audit-level=moderate` on every push and pull request (see `security.yml`)
- PRs that introduce dependencies with **moderate or higher** CVEs are blocked
- Non-exploitable findings (e.g. vulnerabilities in dev-only tools with no runtime attack surface) may be suppressed with documented justification in a PR comment
- All open vulnerabilities must be resolved or justified before any release is tagged

---

## SAST (Static Analysis) Policy

- CodeQL analysis runs on every push to `main` and every pull request (see `codeql.yml`)
- All CodeQL findings of **medium severity or higher** must be resolved or marked as non-exploitable before merging
- Non-exploitable findings may be dismissed in the GitHub Security tab with a written justification
- OpenSSF Scorecard runs on every push and weekly, tracking the overall security posture

---

## Security Measures in Place

| Measure | Tool | Trigger |
|---|---|---|
| Dependency vulnerability scan | `npm audit` | Every push and PR |
| Secret scanning | Gitleaks | Every push and PR |
| Static analysis | CodeQL | Every push, PR, and weekly |
| Supply chain posture | OpenSSF Scorecard | Every push to main and weekly |
| Pinned CI dependencies | Commit SHA pinning | All workflow actions |
| Least-privilege CI tokens | `permissions: read-all` | All workflows |
| Branch protection | GitHub branch rules | Direct push to main blocked |

## MIT License Note

ServiceLens is provided **as-is** under the MIT license. While security issues will be addressed promptly, the software carries no warranty. See [LICENSE](LICENSE) for full terms.
