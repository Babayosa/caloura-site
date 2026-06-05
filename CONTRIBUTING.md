# Contributing to caloura-site

Thanks for your interest. This is a small static site + shell script. Contributions are welcome for bug fixes, accessibility improvements, copy corrections, and appcast/release workflow improvements.

## Stack

- Plain HTML / CSS / vanilla JS — no build system, no package manager
- `release.sh` — Bash; requires Sparkle `sign_update` for actual releases
- Hosted on GitHub Pages (CNAME: `caloura.app`)

## Setup

```bash
git clone https://github.com/<owner>/caloura-site.git
cd caloura-site
# No install step needed — open index.html in a browser or:
python3 -m http.server 8080
```

## Making changes

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b fix/your-topic
   ```
2. Edit the relevant file(s). Keep changes focused — one concern per PR.
3. Preview your changes locally before opening a PR.
4. Open a pull request against `main` with a clear description of what changed and why.

## Release workflow changes

If you are modifying `release.sh`, test locally against a dummy zip (you will not have the real EdDSA key). Document any new dependencies in both `release.sh` comments and `README.md`.

## Code style

- HTML: 2-space indent, semantic elements, no inline styles
- CSS: existing naming conventions (`kebab-case` classes)
- Shell: `set -e`, quote all variables, prefer `[[ ]]` for conditionals
- No minification — keep source readable

## Reporting issues

Open a GitHub issue. Include the browser/OS version for visual bugs, or the exact error output for `release.sh` issues.

## Pull request checklist

- [ ] Changes preview correctly in a browser
- [ ] `appcast.xml` remains valid XML if touched (validate with `xmllint --noout appcast.xml`)
- [ ] No secrets, API keys, or EdDSA private keys included
- [ ] PR description explains the motivation

## License

By contributing you agree that your changes will be licensed under the [MIT License](LICENSE).
