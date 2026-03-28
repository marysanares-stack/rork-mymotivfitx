# Devcontainer usage

This repository includes a VS Code devcontainer at `.devcontainer/` to provide a consistent developer environment (node/bun, linters, TypeScript) without installing everything locally.

## Quick start

- In VS Code open this folder and run: Command Palette → "Dev Containers: Reopen in Container". VS Code will build the container and run the `post-create` script which installs dependencies.
- With the Dev Containers CLI you can also run:

```bash
devcontainer up --workspace-folder .
```

## Common commands inside the container

- Install dependencies (the container runs this in post-create automatically):

```bash
bun i
```

- TypeScript check and lint:

```bash
npx tsc --noEmit
npm run lint
```

- Start the web preview:

```bash
bun run start-web
```

- Start the normal Expo/Rork dev server:

```bash
bun run start
```

## Running EAS builds (preserve dSYMs)

To run iOS production builds that preserve dSYMs for symbolication, prefer remote EAS builds or run EAS on macOS. Example:

```bash
eas build -p ios --profile production
```

If you use post-build hooks to upload dSYMs/sourcemaps (see `scripts/`), make sure Sentry environment variables are set in the build environment: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

## Notes

- The devcontainer is for development (lint/tsc/test). Native iOS builds still require macOS or remote EAS builders.
- If pushing GitHub workflow files fails due to permissions, open a PR from an account/PAT with workflow scope or ask a maintainer to merge the workflow.
