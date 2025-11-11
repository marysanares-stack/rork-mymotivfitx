# Release Checklist

A concise checklist for preparing and shipping a production release of MyMotivFitX.

## 1. Preflight

- [ ] Version bump (`expo.version`, iOS `buildNumber`, Android `versionCode` in `app.json`)
- [ ] `EXPO_PUBLIC_RORK_API_BASE_URL` defined (local export or EAS env)
- [ ] `RORK_AUTH_TOKEN` available for dependency install (if private packages needed)
- [ ] HealthKit descriptions present (iOS) – already configured
- [ ] Icons & splash final (no placeholders)
- [ ] Accessibility labels on interactive elements (workout, hydration, music, AI coach)
- [ ] Global ErrorBoundary integrated
- [ ] Heart-rate & wellness disclaimers present
- [ ] Analytics stub safe (no PII) or replaced with real SDK
- [ ] Cache cleared / fresh install tested
- [ ] Dependencies installed cleanly (`bun i`)
- [ ] Git clean (all changes committed & pushed)

## 2. Build Commands (Copy/Paste)

```bash
# iOS Production Build
EAS_BUILD=ios eas build --platform ios --profile production --non-interactive

# Android Production Build
EAS_BUILD=android eas build --platform android --profile production --non-interactive

# Submit iOS
EAS_SUBMIT=ios eas submit --platform ios --non-interactive

# Submit Android
EAS_SUBMIT=android eas submit --platform android --non-interactive
```

(Env variable labels optional, used only for log clarity.)

## 3. Post-Build Actions

- [ ] App Store Connect: Enable TestFlight groups & invite testers
- [ ] Play Console: Assign AAB to Internal/Closed track & invite testers
- [ ] Confirm processing passed (no missing privacy / permissions warnings)
- [ ] Review analytics/crash monitoring (if enabled)

## 4. Smoke Test (Installed Build)

- [ ] Launch app (no red errors) & navigate through tabs
- [ ] Heart-rate screen loads disclaimer
- [ ] Live workout hero image fades; Estimated badge visible
- [ ] Hydration quick-add persists after restart
- [ ] ErrorBoundary not triggered in normal flow
- [ ] API calls succeed or fail gracefully offline

## 5. Rollback Plan

If critical issue:
1. Pause distribution (remove from testing track if possible).
2. Apply hotfix minimally; bump build numbers (and optionally patch version).
3. Rebuild & resubmit.
4. Communicate to testers; document cause & fix.

## 6. Optional Enhancements

- Crash reporting (Sentry/Bugsnag)
- Real analytics provider
- Automated changelog & tagging
- CI pipeline with lint/test/build gates
- Privacy manifest automation

---
Use this file as an issue template or copy into release notes for each version. Keep it updated as the process evolves.
