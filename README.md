# ServiceLens

A Chrome DevTools extension that captures network requests in real time and automatically groups them by microservice — so you can see at a glance which service is slow, erroring, or noisy.

![License](https://img.shields.io/badge/license-MIT-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![React](https://img.shields.io/badge/react-19-61dafb)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/RishavRajSingh44/ServiceLens/badge)](https://securityscorecards.dev/viewer/?uri=github.com/RishavRajSingh44/ServiceLens)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/13015/badge)](https://www.bestpractices.dev/projects/13015)

> We gladly provide the information in several locales, however, if there is any conflict or inconsistency between the translations, the English version is the authoritative version.

---

## Features

- **Auto service classification** — detects service names from URL subdomains, path segments, SAP/reverse-DNS package prefixes, and OData patterns
- **Custom rules** — define your own path or subdomain patterns to override auto-detection
- **Grouped view** — requests collapsed by service with aggregate stats (request count, average time, error count)
- **Filtering** — filter by service, HTTP status class (2xx / 3xx / 4xx / 5xx), free-text URL search, or failed-only toggle
- **Slow request highlighting** — configurable threshold with visual warning and error colors
- **Export** — download all captured requests as JSON
- **Persistent config** — rules and thresholds saved via `chrome.storage.local`
- **Dark theme** — Tokyonight-inspired monospace UI

---

## Installation

### From source (unpacked extension)

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/RishavRajSingh44/ServiceLens.git
   cd servicelens
   npm install
   ```

2. Build the extension:

   ```bash
   npm run build
   ```

3. Load into Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist/` folder

4. Open Chrome DevTools on any page — a **Network Inspector** tab will appear.

---

## Usage

### Basic

Open DevTools (`F12` or `Cmd+Option+I`) and click the **Network Inspector** panel. Requests are captured automatically as you browse.

### Filtering

| Control | Description |
|---|---|
| Service dropdown | Show only requests from one service |
| Status tabs | Filter by 2xx / 3xx / 4xx / 5xx |
| Search box | Filter by URL substring |
| Failed only | Show only non-2xx requests |

### Configuration

Click the **Config** button to open the settings panel:

- **Service rules** — add entries with a `pattern` (matched against URL path or subdomain) and a `name` (the label to use). Rules are checked before auto-detection.
- **Slow threshold** — requests exceeding this duration (ms) are highlighted in amber; 3× the threshold turns them red.

### Export

Click **Export** to download a JSON file of all currently captured requests.

---

## Classification logic

Service names are resolved in three passes:

1. **Explicit rules** — user-defined patterns matched against the full URL path or subdomain
2. **Subdomain heuristic** — for hostnames with exactly 3 labels (e.g. `auth.example.com`), the first segment is used
3. **Path heuristic** — scans path segments, skipping common noise (`api`, `v1`, `rest`, `odata`, UUIDs, numeric IDs), extracts SAP/reverse-DNS package prefixes, then falls back to the first meaningful segment

---

## Architecture

```
devtools.js          (DevTools page)
    │  chrome.devtools.network.onRequestFinished
    ▼
background.js        (MV3 service worker)
    │  long-lived port, buffers up to 500 requests
    ▼
useRequests.js       (React hook in panel)
    │  chrome.runtime.connect + reconnect with backoff
    ▼
App.jsx              (classifies, filters, groups)
    ├── FilterBar.jsx
    ├── ServiceGroup.jsx
    │       └── RequestRow.jsx
    └── ConfigEditor.jsx
```

---

## Development

```bash
npm run dev      # Vite dev server (UI preview at localhost:5173)
npm run build    # Build extension to dist/
npm run lint     # ESLint
npm test         # Vitest unit tests (classifier logic)
npm run preview  # Preview the built output
```

> The dev server is useful for iterating on UI layout. For full extension behaviour (request capture, chrome.storage), load the built `dist/` as an unpacked extension.

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide including dev setup, commit conventions, DCO sign-off, and PR rules.

Quick checklist before submitting a PR:

```bash
npm run lint   # must pass with zero errors
npm test       # 14 unit tests must pass
npm run build  # must complete successfully
```

See [docs/TESTING.md](docs/TESTING.md) for the manual testing checklist.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of releases and changes.

---

## License

MIT — see [LICENSE](LICENSE) for details.
