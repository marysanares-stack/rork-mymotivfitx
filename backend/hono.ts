import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import type * as SentryType from "@sentry/node";

// Initialize Sentry if configured. We use dynamic import so missing dependency
// won't crash server start in development without Sentry installed.
(async () => {
  try {
    if (process.env.SENTRY_DSN) {
      const Sentry: typeof SentryType = await import("@sentry/node");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "production",
        release: process.env.RELEASE || process.env.GITHUB_SHA || undefined,
      });
    }
  } catch (e) {
    // ignore initialization failures
    console.warn("Sentry init skipped:", e);
  }
})();

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
