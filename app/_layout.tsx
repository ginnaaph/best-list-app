import "../global.css";

import { router, Stack } from "expo-router";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAppFonts } from "@/hooks/use-app-fonts";
import { createSessionFromUrl } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useStore } from "@/store";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://bbfcdcd6f7694dfe2583889393059f68@o4511699661488128.ingest.us.sentry.io/4511699668500480',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const { fontsLoaded } = useAppFonts();
  const syncFromSupabase = useStore((state) => state.syncFromSupabase);
  const clearStore = useStore((state) => state.clearStore);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      try {
        const session = await createSessionFromUrl(url);
        if (session) {
          router.replace("/");
        }
      } catch (error) {
        console.warn("Unable to complete Supabase auth redirect.", error);
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void syncFromSupabase().catch((error: unknown) => {
          console.warn("Unable to sync BestList data after sign in.", error);
        });
      }

      if (event === "SIGNED_OUT") {
        void clearStore().catch((error: unknown) => {
          console.warn("Unable to clear BestList data after sign out.", error);
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearStore, syncFromSupabase]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#F8F8F7" },
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  );
});
