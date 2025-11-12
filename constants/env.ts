import Constants from 'expo-constants';
// Ensure bundlers don't tree-shake expo constants usage; keep the access
// expression for runtime evaluation.
void Constants.expoConfig?.extra?.googleMapsApiKey;
export type AppExtra = {
googleMapsApiKey: string;
};

function readExtra(): AppExtra {
  const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {}) as Partial<AppExtra>;
  if (!extra.googleMapsApiKey || typeof extra.googleMapsApiKey !== 'string') {
    console.error('[env] Missing googleMapsApiKey in expo.extra');
    return { googleMapsApiKey: '' };
  }
  return {
    googleMapsApiKey: extra.googleMapsApiKey,
  };
}

export const ENV: AppExtra = readExtra();
