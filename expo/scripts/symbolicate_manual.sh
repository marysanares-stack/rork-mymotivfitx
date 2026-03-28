#!/usr/bin/env bash
set -euo pipefail
# symbolicate_manual.sh
# Usage: ./scripts/symbolicate_manual.sh /path/to/crash.ips /path/to/dsym_folder [optional:/path/to/IPA]
# Produces /tmp/manual_symbolicate.txt with combined atos/dwarfdump/lldb lookups for addresses found in the crash.

CRASH_FILE=${1:-}
DSYM_DIR=${2:-}
IPA_PATH=${3:-}

OUT=/tmp/manual_symbolicate.txt
>"$OUT"

if [ -z "$CRASH_FILE" ] || [ -z "$DSYM_DIR" ]; then
  echo "Usage: $0 /path/to/crash.ips /path/to/dSYM_folder [optional:/path/to/App.ipa]"
  exit 2
fi

echo "Crash file: $CRASH_FILE" | tee -a "$OUT"
echo "dSYM dir: $DSYM_DIR" | tee -a "$OUT"
[ -n "$IPA_PATH" ] && echo "IPA (optional): $IPA_PATH" | tee -a "$OUT"

# Find DWARF file inside the dSYM dir
DWARF_FILE=$(find "$DSYM_DIR" -type f -name "*${PWD##*/}*" -print -quit || true)
# fallback: any file under Contents/Resources/DWARF
if [ -z "$DWARF_FILE" ]; then
  DWARF_FILE=$(find "$DSYM_DIR" -type f -path "*/Contents/Resources/DWARF/*" -print -quit || true)
fi

if [ -z "$DWARF_FILE" ]; then
  echo "Could not locate DWARF file inside dSYM. You can pass the exact DWARF path as DSYM_DIR." | tee -a "$OUT"
else
  echo "DWARF file: $DWARF_FILE" | tee -a "$OUT"
fi

# If IPA provided, extract the app binary to /tmp and use it for atos
APP_BIN=""
if [ -n "$IPA_PATH" ] && [ -f "$IPA_PATH" ]; then
  TMPPAY=/tmp/_symbolicate_payload_$$
  mkdir -p "$TMPPAY"
  unzip -q "$IPA_PATH" -d "$TMPPAY"
  APP_PATH=$(find "$TMPPAY/Payload" -maxdepth 2 -type d -name "*.app" -print -quit)
  if [ -n "$APP_PATH" ]; then
    # assume the executable has same name as .app folder
    APP_NAME=$(basename "$APP_PATH" .app)
    APP_BIN="$APP_PATH/$APP_NAME"
    echo "Extracted app binary: $APP_BIN" | tee -a "$OUT"
  fi
fi

if [ -z "$APP_BIN" ]; then
  echo "No app binary available for atos (pass IPA as third arg to extract)." | tee -a "$OUT"
fi

echo "--- Parsing crash for addresses ---" | tee -a "$OUT"

# Extract absolute addresses from crash lines that reference the app binary or look like 0x... addresses in stack frames
ADDRS=$(grep -Eo "0x[0-9a-fA-F]{7,16}" "$CRASH_FILE" | sort -u)

if [ -z "$ADDRS" ]; then
  echo "No addresses found in crash file." | tee -a "$OUT"
  exit 0
fi

echo "Found $(echo "$ADDRS" | wc -l) unique addresses." | tee -a "$OUT"

# Determine the load address for the app from Binary Images section (first hex for the app line)
LOAD_ADDR=""
APP_LINE=$(grep -i "Binary Images:" -n "$CRASH_FILE" -A200 | sed -n '1,200p' | grep -i "\b${PWD##*/}\b" -n -m1 || true)
if [ -n "$APP_LINE" ]; then
  # The line contains ranges like 0x1046fc000 - 0x1048... <MyMotivFitX> + offset
  LOAD_ADDR=$(grep -i "Binary Images:" -n "$CRASH_FILE" -A200 | sed -n '1,200p' | grep -i "${PWD##*/}" -m1 | sed -E 's/^\s*([0-9a-fx]+)\s*-.*$/\1/i')
fi

# Fallback: try to parse any line containing .app and pick first hex
if [ -z "$LOAD_ADDR" ]; then
  LOAD_ADDR=$(grep -E "\.app" -n "$CRASH_FILE" -m1 | grep -Eo "0x[0-9a-fA-F]{7,16}" | head -n1 || true)
fi

if [ -n "$LOAD_ADDR" ]; then
  echo "Detected load/base address: $LOAD_ADDR" | tee -a "$OUT"
else
  echo "Could not detect load address; atos lookups will not use -l." | tee -a "$OUT"
fi

echo "--- Running lookups ---" | tee -a "$OUT"

for addr in $ADDRS; do
  echo "\nADDRESS: $addr" | tee -a "$OUT"

  if [ -n "$DWARF_FILE" ]; then
    echo "dwarfdump --lookup $addr $DWARF_FILE" >> "$OUT"
    set +e
    dwarfdump --lookup "$addr" "$DWARF_FILE" >> "$OUT" 2>&1
    set -e
  fi

  if [ -n "$APP_BIN" ]; then
    echo "atos -o $APP_BIN -arch arm64 ${LOAD_ADDR:+-l $LOAD_ADDR} $addr" >> "$OUT"
    set +e
    if [ -n "$LOAD_ADDR" ]; then
      atos -o "$APP_BIN" -arch arm64 -l "$LOAD_ADDR" "$addr" >> "$OUT" 2>&1 || true
    else
      atos -o "$APP_BIN" -arch arm64 "$addr" >> "$OUT" 2>&1 || true
    fi
    set -e
  fi

  # lldb image lookup as a last resort (non-interactive)
  if command -v lldb >/dev/null 2>&1; then
    echo "lldb image lookup --address $addr" >> "$OUT"
    set +e
    lldb -o "image lookup --address $addr" -o "quit" 2>&1 >> "$OUT" || true
    set -e
  fi
done

echo "--- COMPLETE: $OUT" | tee -a "$OUT"
echo "Open $OUT and paste the first ~300 lines here." 
