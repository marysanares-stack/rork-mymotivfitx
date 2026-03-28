// Simple analytics stub for development and polish phase
// Provides no-op logging that can be swapped with a real analytics SDK later.

type Params = Record<string, any> | undefined;

const isDev = __DEV__ === true;

export function logEvent(eventName: string, params?: Params) {
  if (isDev) {
    // Keep logs concise to avoid noise in production builds
      try {
        console.log(`[analytics] ${eventName}`, params ? JSON.stringify(params) : '');
      } catch {
      // ignore serialization errors
    }
  }
}

export function trackScreen(screenName: string, params?: Params) {
  logEvent(`screen_${screenName}`, params);
}

export default { logEvent, trackScreen };
