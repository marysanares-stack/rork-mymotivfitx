#!/usr/bin/env bash
set -euo pipefail

# symbolicate_or_atos.sh
# Tries to run symbolicatecrash (if Xcode tools present) against a crash .ips and a Symbols file.
# Falls back to atos-based address mapping using the extracted app binary if symbolicatecrash isn't available.
# Adjust CRASH_PATH and SYMBOLS_DIR variables below if your files are elsewhere.

# --- Config (edit if needed) ---
CRASH_PATH="$HOME/Library/Containers/com.apple.mail/Data/Library/Mail Downloads/893B6570-8893-4145-BCCD-076D7B6BE9FD/MyMotivFitX-2025-11-11-215113.ips"
SYMBOLS_FILE="/tmp/MyMotivFitX_dsym/Symbols/4136DA6E-5865-34F3-BF84-1FECF908F109.symbols"
APP_BINARY="/tmp/MyMotivFitX_dsym/Payload/MyMotivFitX.app/MyMotivFitX"
SYMBOLICATED_OUT="/tmp/MyMotivFitX_symbolicated.txt"
ATOS_OUT="/tmp/atos_mappings.txt"

# --- helpers ---
exists() { [ -e "$1" ]; }
err() { echo "ERROR: $*" >&2; }
info() { echo "[info] $*"; }

# sanity checks
info "Checking input files"
if ! exists "$CRASH_PATH"; then
  err "Crash file not found: $CRASH_PATH"
  exit 1
fi
if ! exists "$SYMBOLS_FILE"; then
  err "Symbols file not found: $SYMBOLS_FILE"
  echo "If you only have the dSYM zip, unzip it to /tmp/MyMotivFitX_dsym and re-run this script."
  exit 1
fi
if ! exists "$APP_BINARY"; then
  err "App binary not found: $APP_BINARY"
  echo "Make sure you extracted the IPA and the app binary is at $APP_BINARY"
  exit 1
fi

# try to find symbolicatecrash
SYMBOLICATECRASH_PATH=""
if command -v xcrun >/dev/null 2>&1; then
  # xcrun --find may print an error if not available; capture quietly
  if xcrun --find symbolicatecrash >/dev/null 2>&1; then
    SYMBOLICATECRASH_PATH=$(xcrun --find symbolicatecrash 2>/dev/null || true)
  fi
fi
# fallback to known Xcode location
if [ -z "$SYMBOLICATECRASH_PATH" ] && [ -x "/Applications/Xcode.app/Contents/SharedFrameworks/DVTFoundation.framework/Versions/A/Resources/symbolicatecrash" ]; then
  SYMBOLICATECRASH_PATH="/Applications/Xcode.app/Contents/SharedFrameworks/DVTFoundation.framework/Versions/A/Resources/symbolicatecrash"
fi

# If symbolicatecrash is available, run it
if [ -n "$SYMBOLICATECRASH_PATH" ]; then
  info "Found symbolicatecrash at: $SYMBOLICATECRASH_PATH"
  info "Running symbolicatecrash... (this may take a minute)"
  # run and capture output (try without sudo first)
  if "$SYMBOLICATECRASH_PATH" "$CRASH_PATH" "$SYMBOLS_FILE" > "$SYMBOLICATED_OUT" 2>&1; then
    info "Symbolication completed; output: $SYMBOLICATED_OUT"
    echo
    echo "=== first 400 lines of symbolicated output ==="
    sed -n '1,400p' "$SYMBOLICATED_OUT" || true
    echo
    echo "=== tail (last 40 lines) ==="
    tail -n 40 "$SYMBOLICATED_OUT" || true
    exit 0
  else
    err "symbolicatecrash ran but returned non-zero exit code. Output saved to $SYMBOLICATED_OUT"
    echo
    sed -n '1,200p' "$SYMBOLICATED_OUT" || true
    echo
    err "Falling back to atos-based mapping"
  fi
else
  info "symbolicatecrash not found. Falling back to atos-based mapping."
fi

# --- ATOS fallback ---
info "Running atos fallback mapping"
# Attempt to read the Binary Images line for MyMotivFitX to determine base
APP_LINE=$(awk '/Binary Images:/{p=1} p && /MyMotivFitX/ {print; exit}' "$CRASH_PATH" || true)
if [ -z "$APP_LINE" ]; then
  # looser match
  APP_LINE=$(awk '/Binary Images:/{p=1} p && /MyMotivFit/ {print; exit}' "$CRASH_PATH" || true)
fi

BASE_HEX=""
if [ -n "$APP_LINE" ]; then
  BASE_HEX=$(echo "$APP_LINE" | awk '{print $1}' | cut -d- -f1)
  info "Detected app Binary Image line:"
  echo "$APP_LINE"
  info "Using BASE_HEX=$BASE_HEX"
else
  info "No MyMotivFitX Binary Images line found in crash; atos will run without explicit -l base."
fi

# get candidate addresses: prefer lines mentioning MyMotivFitX, otherwise the crashed thread
ADDRS_FILE=$(mktemp)
grep -n "MyMotivFitX" "$CRASH_PATH" | grep -Eo '0x[0-9a-fA-F]+' | sort -u > "$ADDRS_FILE" || true
if [ ! -s "$ADDRS_FILE" ]; then
  awk '/Thread [0-9]+ Crashed:/{p=1} p && /0x[0-9a-fA-F]+/{print}' "$CRASH_PATH" | grep -Eo '0x[0-9a-fA-F]+' | sort -u > "$ADDRS_FILE" || true
fi

if [ ! -s "$ADDRS_FILE" ]; then
  err "No addresses extracted from crash for mapping. Showing crash header and crashed thread so you can paste relevant sections."
  echo
  sed -n '1,200p' "$CRASH_PATH" || true
  echo
  awk '/Thread [0-9]+ Crashed:/{p=1} p' "$CRASH_PATH" | sed -n '1,200p'
  rm -f "$ADDRS_FILE"
  exit 1
fi

# run atos mapping
rm -f "$ATOS_OUT" && touch "$ATOS_OUT"
echo "APP=$APP_BINARY" >> "$ATOS_OUT"
echo "BASE=$BASE_HEX" >> "$ATOS_OUT"
echo "CRASH=$CRASH_PATH" >> "$ATOS_OUT"
echo >> "$ATOS_OUT"

while read -r addr; do
  printf "%s  " "$addr" >> "$ATOS_OUT"
  if [ -n "$BASE_HEX" ]; then
    /usr/bin/atos -o "$APP_BINARY" -arch arm64 -l "$BASE_HEX" "$addr" >> "$ATOS_OUT" 2>/dev/null || echo "atos failed for $addr" >> "$ATOS_OUT"
  else
    /usr/bin/atos -o "$APP_BINARY" -arch arm64 "$addr" >> "$ATOS_OUT" 2>/dev/null || echo "atos failed for $addr" >> "$ATOS_OUT"
  fi
done < "$ADDRS_FILE"

info "ATOS mapping complete; showing first 200 lines of $ATOS_OUT"
sed -n '1,200p' "$ATOS_OUT" || true

echo
info "Done. Files created:"
ls -lh "$SYMBOLICATED_OUT" 2>/dev/null || true
ls -lh "$ATOS_OUT" || true
rm -f "$ADDRS_FILE"

exit 0
