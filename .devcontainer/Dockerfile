# Dev container for MyMotivFitX — lightweight Node + Bun + tooling
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-20

# Install needed system dependencies
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl \
  git \
  python3 \
  build-essential \
  unzip \
  zip \
  && rm -rf /var/lib/apt/lists/*

# Install bun (stable installer) into root; symlink into /usr/local/bin
RUN set -eux; \
  if [ ! -x "/usr/local/bin/bun" ]; then \
    curl -fsSL https://bun.sh/install | bash -s -- --no-enable || true; \
    if [ -d "/root/.bun/bin" ]; then \
      ln -sf /root/.bun/bin/bun /usr/local/bin/bun || true; \
    fi; \
  fi

# Ensure workspace folder exists and adjust perms for vscode user
RUN mkdir -p /workspace
WORKDIR /workspace

# Default user is 'vscode' from base image
USER vscode

# Keep the devcontainer small; heavy items like Android SDK are not included.
