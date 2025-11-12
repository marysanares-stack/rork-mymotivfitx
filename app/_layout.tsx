import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FitnessProvider } from "@/contexts/FitnessContext";
import { SocialProvider } from "@/contexts/SocialContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { trpc, trpcClient } from "@/lib/trpc";
import { MotivationProvider } from "@/contexts/MotivationContext";
import { HealthSyncProvider } from "@/contexts/HealthSyncContext";
import Colors from "@/constants/colors";
import { useFitness } from "@/contexts/FitnessContext";

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
  const [appIsReady, setAppIsReady] = React.useState(false);

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
