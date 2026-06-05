# caloura-site

Landing page and Sparkle appcast for [Caloura](https://caloura.app) — screenshot capture, annotation, and OCR for macOS.

## What this repo contains

| File / directory | Purpose |
|---|---|
| `index.html` + `style.css` + `flow-field.js` | Static marketing site, served via GitHub Pages at `caloura.app` |
| `appcast.xml` | Sparkle RSS feed; the macOS app polls this to check for updates |
| `releases/` | Signed `.zip` archives referenced by `appcast.xml` |
| `release.sh` | Helper script — signs a new build, updates `appcast.xml` and `index.html`, then commits and pushes |

## Prerequisites

- A modern browser (development) or any static file server
- [Sparkle](https://sparkle-project.org) `sign_update` binary for cutting releases — install to `~/Applications/Sparkle/bin/sign_update` or anywhere in `$PATH`

## Running the site locally

No build step required. Open `index.html` directly in a browser, or serve with any static server:

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080
```

## Cutting a release

```bash
# Build and export a signed zip from Xcode, then:
./release.sh /path/to/Caloura-X.Y.Z.zip
```

`release.sh` will:
1. Copy the zip to `releases/`
2. Call `sign_update` to generate an EdDSA signature
3. Prepend a new `<item>` to `appcast.xml`
4. Update the download link in `index.html`
5. Commit and push to GitHub Pages

The script requires `sign_update` from the Sparkle framework. If it is not found the script exits with a clear error before making any changes.

## Appcast format

`appcast.xml` is a standard Sparkle RSS feed. Each `<item>` carries:

- `sparkle:version` — monotonically increasing build number used by Sparkle for version comparison
- `sparkle:shortVersionString` — human-readable version shown to users
- `sparkle:edSignature` — EdDSA signature over the zip, verified by the app before installation
- `sparkle:minimumSystemVersion` — minimum macOS version required

Sparkle documentation: https://sparkle-project.org/documentation/

## License

MIT — see [LICENSE](LICENSE).
