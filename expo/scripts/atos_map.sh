#!/usr/bin/env bash
# Quick ATOS mapping helper for MyMotivFitX crash
# Save as scripts/atos_map.sh and run: bash scripts/atos_map.sh

CRASH="$HOME/Library/Containers/com.apple.mail/Data/Library/Mail Downloads/893B6570-8893-4145-BCCD-076D7B6BE9FD/MyMotivFitX-2025-11-11-215113.ips"
APP="/tmp/MyMotivFitX_dsym/Payload/MyMotivFitX.app/MyMotivFitX"
BASE="0x1046fc000"
OUT="/tmp/atos_mappings.txt"

echo "Checking files..."
echo "CRASH: $CRASH"
echo "APP:   $APP"
echo "BASE:  $BASE"
echo
if [ ! -f "$CRASH" ]; then
  echo "ERROR: crash file not found at $CRASH"
  exit 1
fi
if [ ! -f "$APP" ]; then
  echo "ERROR: app binary not found at $APP"
  exit 1
fi

rm -f "$OUT" && touch "$OUT"
echo "Using APP=$APP" >> "$OUT"
echo "Using CRASH=$CRASH" >> "$OUT"
echo "Using BASE=$BASE" >> "$OUT"

# Extract addresses and map them with atos
grep -Eo '0x[0-9a-fA-F]+' "$CRASH" | sort -u | while read -r addr; do
  printf "%s  " "$addr" >> "$OUT"
  /usr/bin/atos -o "$APP" -arch arm64 -l "$BASE" "$addr" >> "$OUT" 2>/dev/null || echo "atos failed for $addr" >> "$OUT"
done

echo
echo "=== Results (first 200 lines) ==="
sed -n '1,200p' "$OUT" || true
echo "=== Done. Full output at $OUT ==="
