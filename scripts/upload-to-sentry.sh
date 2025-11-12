#!/usr/bin/env bash
set -euo pipefail

# uploads dSYMs, ProGuard mapping files and JS sourcemaps to Sentry
# Usage: ./scripts/upload-to-sentry.sh --release RELEASE --org ORG --project PROJECT [--dsym path] [--mapping path] [--sourcemaps path]

show_help() {
  cat <<EOF
Usage: $0 --release RELEASE --org ORG --project PROJECT [--dsym /path/to/dsym.zip] [--mapping /path/to/mapping.txt] [--sourcemaps /path/to/sourcemaps]

Environment:
  SENTRY_AUTH_TOKEN  (required)

This script expects 'sentry-cli' to be available on PATH. Use the GitHub Action 'getsentry/action-setup-sentry-cli' or install manually.
EOF
}

if [ "$#" -eq 0 ]; then
  show_help
  exit 1
fi

RELEASE=""
ORG=""
PROJECT=""
DSYM_PATH=""
MAPPING_PATH=""
SOURCEMAPS_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --release) RELEASE="$2"; shift 2;;
    --org) ORG="$2"; shift 2;;
    --project) PROJECT="$2"; shift 2;;
    --dsym) DSYM_PATH="$2"; shift 2;;
    --mapping) MAPPING_PATH="$2"; shift 2;;
    --sourcemaps) SOURCEMAPS_PATH="$2"; shift 2;;
    -h|--help) show_help; exit 0;;
    *) echo "Unknown arg: $1"; show_help; exit 1;;
  esac
done

if [ -z "${SENTRY_AUTH_TOKEN-}" ]; then
  echo "ERROR: SENTRY_AUTH_TOKEN is not set. Export it and retry." >&2
  exit 2
fi

if [ -z "$RELEASE" ] || [ -z "$ORG" ] || [ -z "$PROJECT" ]; then
  echo "ERROR: --release, --org and --project are required" >&2
  show_help
  exit 3
fi

echo "Using Sentry org=$ORG project=$PROJECT release=$RELEASE"

set -x

# create release if not exists (sentry-cli is idempotent)
sentry-cli releases new "$RELEASE" || true

TMPDIR=$(mktemp -d)
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

if [ -n "$DSYM_PATH" ]; then
  echo "Uploading dSYM(s) from $DSYM_PATH"
  # if a zip, unzip first
  case "$DSYM_PATH" in
    *.zip)
      unzip -q "$DSYM_PATH" -d "$TMPDIR/dsym"
      DIFF_PATH="$TMPDIR/dsym"
      ;;
    *)
      DIFF_PATH="$DSYM_PATH"
      ;;
  esac

  # upload anything that looks like a dSYM or symbol bundle
  sentry-cli upload-dif --org "$ORG" --project "$PROJECT" "$DIFF_PATH"
fi

if [ -n "$MAPPING_PATH" ]; then
  echo "Uploading Android mapping from $MAPPING_PATH"
  sentry-cli upload-proguard --org "$ORG" --project "$PROJECT" "$MAPPING_PATH"
fi

if [ -n "$SOURCEMAPS_PATH" ]; then
  echo "Uploading JS sourcemaps from $SOURCEMAPS_PATH"
  # If it's a directory or archive, try to upload with rewrite
  if [ -d "$SOURCEMAPS_PATH" ]; then
    sentry-cli upload-sourcemaps --org "$ORG" --project "$PROJECT" --rewrite "$SOURCEMAPS_PATH"
  else
    # if zipped, unzip to tmp
    case "$SOURCEMAPS_PATH" in
      *.zip)
        unzip -q "$SOURCEMAPS_PATH" -d "$TMPDIR/smaps"
        sentry-cli upload-sourcemaps --org "$ORG" --project "$PROJECT" --rewrite "$TMPDIR/smaps"
        ;;
      *)
        echo "Unknown sourcemaps path type: $SOURCEMAPS_PATH" >&2
        ;;
    esac
  fi
fi

echo "Finalizing release $RELEASE"
sentry-cli releases finalize "$RELEASE" || true

echo "Upload complete"
