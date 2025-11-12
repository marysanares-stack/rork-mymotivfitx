#!/usr/bin/env bash
set -euo pipefail

echo "Running devcontainer post-create script"

# Ensure bun is available (installed by Dockerfile into /root/.bun for root user).
if ! command -v bun >/dev/null 2>&1; then
  echo "bun not found in PATH, trying user install..."
  curl -fsSL https://bun.sh/install | bash -s -- --no-enable
  export BUN_INSTALL="$HOME/.bun"
  mkdir -p "$HOME/.bun/bin"
  ln -sf "$HOME/.bun/bin/bun" "/usr/local/bin/bun" || true
fi

if command -v bun >/dev/null 2>&1; then
  echo "bun version: $(bun --version)"
fi

# Install dependencies. Prefer bun if available (project uses bun), otherwise fallback to npm.
if command -v bun >/dev/null 2>&1; then
  echo "Installing dependencies with bun..."
  bun install || echo "bun install failed — you can try 'bun install' manually"
else
  echo "bun not available; running npm install"
  npm install || echo "npm install failed — please run manually"
fi

# Install common global CLIs used during development
if ! command -v eas >/dev/null 2>&1; then
  echo "Installing eas-cli globally"
  npm install -g eas-cli || true
fi
if ! command -v expo >/dev/null 2>&1; then
  echo "Installing expo-cli globally"
  npm install -g expo-cli || true
fi

# Print helpful next steps
cat <<'EOF'
Dev container setup complete.
Next steps:
 - Reopen the folder in the devcontainer (VS Code will do this automatically when you select "Reopen in Container").
 - Use the integrated terminal to run checks: `npx tsc --noEmit`, `npm run lint` or `bun lint`.
 - Start the web preview: `bun run start-web` or `npm run start-web`.
Notes:
 - iOS native builds require macOS and cannot run inside this Linux container; use EAS remote builds for iOS artifacts.
 - Android SDK and emulator are not included in this container image; if you need Android local builds, we'll need a larger image and to install the Android SDK (heavy).
EOF
