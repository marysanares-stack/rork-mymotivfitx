#!/usr/bin/env bash
set -euo pipefail

# EAS post-build script to find and upload dSYMs and sourcemaps to Sentry
# Intended to be called from an EAS build hook or CI run after the build finishes.

# Example environment variables expected:
# SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, EAS_BUILD_ID, EXPO_APP_VERSION, EXPO_APP_BUILD_NUMBER

if [ -z "${SENTRY_AUTH_TOKEN-}" ]; then
  echo "SENTRY_AUTH_TOKEN is not set. Skipping upload." >&2
  exit 0
fi

RELEASE="${RELEASE:-${EAS_BUILD_ID:-${EXPO_APP_VERSION:-unknown}}}"
ORG="${SENTRY_ORG:-}"
PROJECT="${SENTRY_PROJECT:-}"

if [ -z "$ORG" ] || [ -z "$PROJECT" ]; then
  echo "SENTRY_ORG and SENTRY_PROJECT must be set for upload. Skipping." >&2
  exit 0
fi

echo "EAS post-build: release=$RELEASE org=$ORG project=$PROJECT"

# Try to locate dSYM artifacts from EAS artifacts dir (if available)
ARTIFACT_DIR="./artifacts"
DSYM_PATH=""
if [ -d "$ARTIFACT_DIR" ]; then
  # find common dSYM zips
  DSYM_PATH=$(find "$ARTIFACT_DIR" -type f -iname "*dsym*.zip" -print -quit || true)
fi

# If not found, check for environment-provided path
if [ -z "$DSYM_PATH" ] && [ -n "${DSYM_DOWNLOAD_URL-}" ]; then
  echo "Downloading dSYM from DSYM_DOWNLOAD_URL"
  mkdir -p /tmp/eas_dsym
  curl -sSfL "$DSYM_DOWNLOAD_URL" -o /tmp/eas_dsym/dsym.zip
  DSYM_PATH="/tmp/eas_dsym/dsym.zip"
fi

# Upload dSYM if found
if [ -n "$DSYM_PATH" ]; then
  echo "Found dSYM: $DSYM_PATH"
  ./scripts/upload-to-sentry.sh --release "$RELEASE" --org "$ORG" --project "$PROJECT" --dsym "$DSYM_PATH"
else
  echo "No dSYM found in artifact dir; ensure EAS exposes dSYM or download from App Store Connect." >&2
fi

# Optionally upload JS sourcemaps from a known build output location
SOURCEMAPS_DIR="./.sourcemaps"
if [ -d "$SOURCEMAPS_DIR" ]; then
  ./scripts/upload-to-sentry.sh --release "$RELEASE" --org "$ORG" --project "$PROJECT" --sourcemaps "$SOURCEMAPS_DIR"
fi

echo "EAS post-build script complete"
