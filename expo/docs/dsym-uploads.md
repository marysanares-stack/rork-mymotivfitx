## dSYM preservation and upload

This document explains how to fetch dSYMs for iOS builds and how to use the helper script `scripts/upload-dsym.sh` to verify and upload dSYMs to Sentry.

Why keep dSYMs
- dSYMs map native addresses to source filenames and line numbers. They are required to symbolicate native crash reports (the ones with addresses and mach-o UUIDs).
- Keep the dSYM for every production build that you distribute.

Where to retrieve dSYMs

- Expo / EAS build page
  - The build detail page under `expo.dev` sometimes shows a "Download dSYM" link in the Artifacts/Downloads area. This is only visible to the project owner or team members with proper permissions.

- App Store Connect / TestFlight
  - App Store Connect → My Apps → Select app → Activity → Builds → select the build → Download dSYM.

- Xcode Organizer (if you built locally or have access to archive)
  - Open Xcode → Window → Organizer → Archives → select an archive → Show in Finder → right click → Show Package Contents → `dSYMs/`

Using the helper scripts

We added two helper scripts in `scripts/`:

- `scripts/upload-to-sentry.sh` — the main uploader that calls `sentry-cli` to upload dSYMs, Android mapping files and JS sourcemaps. Use this in CI and locally. Usage example:

```bash
chmod +x ./scripts/upload-to-sentry.sh
export SENTRY_AUTH_TOKEN=...
./scripts/upload-to-sentry.sh --release "1.0.2-4" --org "your-org" --project "your-ios-project" --dsym /path/to/MyMotivFitX.app.dSYM.zip
```

- `scripts/eas-post-build.sh` — a thin wrapper intended to run after an EAS build. It tries to locate dSYM artifacts under `./artifacts` or download from a `DSYM_DOWNLOAD_URL` env var and then calls `upload-to-sentry.sh`.

Example (CI/EAS): set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` as secrets and run the post-build script with the `EAS_BUILD_ID` or another release name in env:

```bash
export SENTRY_AUTH_TOKEN=...
export SENTRY_ORG=your-org
export SENTRY_PROJECT=your-ios-project
export EAS_BUILD_ID=$EAS_BUILD_ID # or set RELEASE
chmod +x ./scripts/eas-post-build.sh
./scripts/eas-post-build.sh
```

What the uploader does
- Creates a release in Sentry with the provided `--release` (idempotent).
- Uploads dSYM bundles using `sentry-cli upload-dif`.
- Uploads Android `mapping.txt` via `sentry-cli upload-proguard`.
- Uploads JS sourcemaps via `sentry-cli upload-sourcemaps --rewrite`.
- Finalizes the release.

If you prefer automated uploads in CI
- Add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` to your CI provider's secrets.
- Run `scripts/eas-post-build.sh` as a post-build step. For GitHub Actions an example workflow was added at `.github/workflows/upload-sentry.yml`.


Troubleshooting
- `dwarfdump` not found: install Xcode command line tools: `xcode-select --install`.
- `sentry-cli` not found: install from Sentry docs or `brew install getsentry/tools/sentry-cli`.
- If the dSYM UUID does not match the crash: you have a mismatched dSYM (from a different build). Find the dSYM for the exact build that generated the crash.

If you'd like, I can add a CI job snippet (GitHub Actions or your CI) to automatically download and archive dSYMs after EAS builds and upload them to your artifact store or to Sentry.
