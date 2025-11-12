#!/usr/bin/env bash
set -euo pipefail

# upload-dsym.sh
# Small helper to verify a dSYM's UUID(s) and optionally upload to Sentry
# Usage: ./scripts/upload-dsym.sh <path-to-dsym-or-zip> [--sentry]

print_usage() {
  cat <<EOF
Usage: $0 <path-to-dsym-or-zip> [--sentry]

Options:
  --sentry    Upload the dSYM (or extracted dSYMs) to Sentry using sentry-cli.

Environment variables for Sentry upload:
  SENTRY_AUTH_TOKEN  (required for upload)
  SENTRY_ORG         (optional)
  SENTRY_PROJECT     (optional)

The script will:
  - unzip a provided .zip if necessary
  - locate dSYM bundles and print their UUIDs via dwarfdump
  - optionally upload them to Sentry via sentry-cli

EOF
}

if [ "$#" -lt 1 ]; then
  print_usage
  exit 1
fi

INPUT_PATH="$1"
DO_UPLOAD=false
if [ "${2-}" = "--sentry" ]; then
  DO_UPLOAD=true
fi

TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "[upload-dsym] Input: $INPUT_PATH"

if [ ! -e "$INPUT_PATH" ]; then
  echo "Error: path does not exist: $INPUT_PATH" >&2
  exit 2
fi

work_dir="$TMP_DIR/work"
mkdir -p "$work_dir"

if [[ "$INPUT_PATH" == *.zip ]]; then
  echo "[upload-dsym] Unzipping $INPUT_PATH to $work_dir"
  unzip -q "$INPUT_PATH" -d "$work_dir"
else
  # copy the provided path into work dir
  cp -R "$INPUT_PATH" "$work_dir/"
fi

find "$work_dir" -type d -name "*.app.dSYM" -print0 | while IFS= read -r -d $'\0' dsym; do
  echo "\nFound dSYM: $dsym"
  dwarfPath="$dsym/Contents/Resources/DWARF/"
  if [ -d "$dwarfPath" ]; then
    for bin in "$dwarfPath"*; do
      if [ -f "$bin" ]; then
        echo "[upload-dsym] dwarfdump --uuid $bin"
        dwarfdump --uuid "$bin" || true
      fi
    done
  else
    echo "[upload-dsym] WARNING: DWARF path missing: $dwarfPath"
  fi

  if [ "$DO_UPLOAD" = true ]; then
    if ! command -v sentry-cli >/dev/null 2>&1; then
      echo "sentry-cli not found in PATH. Install it or toggle off --sentry." >&2
      exit 3
    fi
    if [ -z "${SENTRY_AUTH_TOKEN-}" ]; then
      echo "SENTRY_AUTH_TOKEN not set in environment. Cannot upload." >&2
      exit 4
    fi

    echo "[upload-dsym] Uploading $dsym to Sentry..."
    # sentry-cli expects a path to the dSYM bundle or a directory
    # We upload the bundle path directly
    if [ -n "${SENTRY_ORG-}" ] && [ -n "${SENTRY_PROJECT-}" ]; then
      sentry-cli upload-dif --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" "$dsym"
    else
      sentry-cli upload-dif "$dsym"
    fi
    echo "[upload-dsym] Upload completed for $dsym"
  fi
done

echo "\n[upload-dsym] Done. Cleaned up temporary files."
