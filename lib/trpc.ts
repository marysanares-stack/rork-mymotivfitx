import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (): string => {
  const extra = (Constants?.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const fromExtra = typeof extra.EXPO_PUBLIC_RORK_API_BASE_URL === "string" ? (extra.EXPO_PUBLIC_RORK_API_BASE_URL as string) : undefined;
  const fromEnv = typeof process.env.EXPO_PUBLIC_RORK_API_BASE_URL === "string" ? process.env.EXPO_PUBLIC_RORK_API_BASE_URL : undefined;
  const base = fromExtra || fromEnv;
  if (typeof base === "string" && base.length > 0) {
    return base;
  }
  // Avoid throwing during module initialization which can crash the app on startup
  // (for example when ENV isn't set in some build environments). Log a clear
  // warning and fall back to a safe default (localhost) so the app doesn't
  // catastrophically fail. Network calls will still fail, but we won't crash.
  // If you want strict behavior, set the env in app.json or shell env.
  //
  // NOTE: Keep this non-throwing to prevent runtime crashes during JS bundle
  // initialization.
  console.warn(
    "Missing EXPO_PUBLIC_RORK_API_BASE_URL. Define it in app.json under expo.extra or export it in your shell env. Falling back to http://localhost:3000"
  );
  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
