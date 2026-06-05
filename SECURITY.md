# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities **privately** — do not open a public issue.

Use GitHub's private vulnerability reporting: open this repository's **Security**
tab and click **Report a vulnerability**. If that is unavailable, contact the
maintainer through their GitHub profile: https://github.com/Babayosa

When reporting, please include:
- A description of the vulnerability and its impact
- Steps to reproduce, or a proof of concept
- The affected file or commit

You can expect an initial response within a few days.

## Scope

This repository contains a static marketing site plus the **Sparkle appcast**
(`appcast.xml`) that the Caloura macOS app polls for updates. The appcast carries
only public per-release EdDSA *signatures* — the private signing key is never
stored in this repository. Reports of a malformed or spoofable appcast, or any
key material accidentally committed, are especially welcome.

## Supported Versions

Only the currently deployed site and the latest appcast entries (latest `main`)
are supported.
