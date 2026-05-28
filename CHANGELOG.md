# Changelog

All notable changes to ServiceLens are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `CONTRIBUTING.md` — full contribution guide with DCO sign-off, dev workflow, commit conventions, and PR rules
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `SECURITY.md` — vulnerability reporting via GitHub Security Advisories
- `CLA.md` — MIT Contributor License Agreement
- `CHANGELOG.md` — this file
- GitHub issue templates: bug report, feature request, good first issue, and security advisory routing
- GitHub PR template with DCO sign-off checklist
- Vitest unit test suite for `classifier.js` (14 tests covering noise filtering, subdomain heuristic, path heuristic, and user rules)
- `docs/TESTING.md` — manual and automated testing checklist
- OpenSSF Scorecard workflow with pinned action commit hashes
- CodeQL static analysis workflow (JavaScript, runs on push and weekly schedule)
- Gitleaks secret scanning workflow
- Dependabot config for weekly npm and GitHub Actions dependency updates
- OpenSSF Scorecard and Best Practices badges in README

### Changed
- `ci.yml` — added `npm test` step; pinned all actions to full commit SHAs; added `permissions: read-all`
- `codeql.yml` — pinned all actions to full commit SHAs; added `permissions: read-all`
- `gitleaks.yml` — pinned all actions to full commit SHAs; added `permissions: read-all`
- `security.yml` — pinned all actions to full commit SHAs; added `permissions: read-all`; removed `dependency-review-action` step (requires Dependency graph setting)
- `scorecard.yml` — updated `ossf/scorecard-action` from `v2.4.0` (stale hash) to `v2.4.3`
- `classifier.js` — added `STATIC_ASSET_NOISE` regex to filter Vite HMR, Next.js static chunks, favicon, robots.txt, sitemap, service workers; added `CDN_NOISE_HOST` regex to filter Google Fonts, jsDelivr, unpkg, cdnjs, typekit, fontawesome
- `vite.config.js` — fixed `__dirname` not defined in ESM context
- README — expanded Contributing section to link CONTRIBUTING.md and CHANGELOG; added `npm test` to dev commands; fixed clone URL casing
- Upgraded `vite` from `^5.4.21` to `^6.4.2` to resolve esbuild CVE (GHSA-67mh-4wv8-2f99)

### Fixed
- ESLint: `chrome` is not defined — added `/* global chrome */` to all files using Chrome APIs
- ESLint: ref mutation during render in `useRequests.js` — moved `onRequestRef.current` assignments into `useEffect`
- ESLint: unused catch bindings — changed all `catch (_e)` to `catch` (ES2019 optional catch binding)
- ESLint: useless escape characters `\@` and `\_` in classifier regex
- ESLint: unused `statusText` destructuring in `RequestRow.jsx`
- ESLint: unused `_panel` parameter in `devtools.js`
- Security: `postcss <8.5.10` CVE (GHSA-qx2v-qp2m-jg93) — resolved via `npm audit fix`

---

## [1.0.0] - 2026-05-13

### Added
- Initial release of ServiceLens Chrome DevTools extension
- Auto-classification of network requests by microservice using subdomain heuristics, path heuristics, and SAP/reverse-DNS package prefix extraction
- User-defined service rules (path and subdomain pattern matching) via Config panel
- Grouped request view with per-service aggregate stats (request count, average time, error count)
- Filtering by service, HTTP status class (2xx / 3xx / 4xx / 5xx), URL text search, and failed-only toggle
- Slow request highlighting with configurable threshold (amber at 1×, red at 3×)
- JSON export of all captured requests
- Persistent config via `chrome.storage.local`
- Dark Tokyonight-inspired UI
- Manifest V3 service worker with request buffering (up to 500 requests) and reconnect logic
- Automatic filtering of Vite dev server, Next.js static, and CDN/font noise requests

### Security
- No host permissions — extension only reads `chrome.devtools.network` events
- All request data processed locally, never sent to external servers
- Dependency audit via `npm audit` on every CI run

[1.0.0]: https://github.com/RishavRajSingh44/ServiceLens/releases/tag/v1.0.0
