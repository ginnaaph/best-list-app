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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
}
