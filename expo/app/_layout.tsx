import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FitnessProvider, useFitness } from "@/contexts/FitnessContext";
import { SocialProvider } from "@/contexts/SocialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { trpc, trpcClient } from "@/lib/trpc";
import { MotivationProvider } from "@/contexts/MotivationContext";
import { HealthSyncProvider } from "@/contexts/HealthSyncContext";
import Colors from "@/constants/colors";
// useFitness is used inside RootLayoutNav

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useFitness();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    const needsOnboarding = !user?.name || !user?.email;
    if (needsOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isLoading, user?.name, user?.email, pathname, router]);

  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerShown: true,
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerTintColor: Colors.text,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="friend-search" options={{ title: 'Find Friends' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    // Initialize Sentry if available. We use dynamic imports so missing packages
    // won't break local development until you install the SDKs.
    (async () => {
      try {
        const release =
          process.env.EAS_BUILD_ID || `${process.env.EXPO_APP_VERSION || "unknown"}-${process.env.EXPO_APP_BUILD_NUMBER || "0"}`;
        const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || null;
        if (!dsn) return;

        if (Platform.OS === "web") {
          const Sentry = await import("@sentry/react");
          Sentry.init({
            dsn,
            release,
            environment: process.env.NODE_ENV || "production",
          });
        } else {
          const Sentry = await import("@sentry/react-native");
          Sentry.init({
            dsn,
            release,
            environment: process.env.NODE_ENV || "production",
            tracesSampleRate: 0.05,
            enableNative: true,
          });
        }
      } catch (err) {
        // Non-fatal — fail gracefully if sentry packages aren't installed yet
        // or initialization cannot run in this environment.
        console.warn("Sentry init skipped:", err);
      }
    })();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <FitnessProvider>
          <SocialProvider>
            <GroupsProvider>
              <MotivationProvider>
                <HealthSyncProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <RootLayoutNav />
                  </GestureHandlerRootView>
                </HealthSyncProvider>
              </MotivationProvider>
            </GroupsProvider>
          </SocialProvider>
        </FitnessProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
